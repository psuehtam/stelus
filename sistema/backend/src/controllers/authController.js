import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, queryOne } from '../lib/db.js';
import { mapRow, mapRows } from '../lib/mappers.js';
import { clearSessionCookie, setSessionCookie } from '../lib/sessionCookie.js';

export async function login(req, res, next) {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
    }

    const row = await queryOne('SELECT * FROM usuarios WHERE email = ?', [email]);
    const usuario = mapRow(row);
    if (!usuario || !usuario.ativo) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const valido = await bcrypt.compare(senha, usuario.senhaHash);
    if (!valido) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, perfil: usuario.perfil, nome: usuario.nome },
      process.env.JWT_SECRET,
      { expiresIn: '12h' },
    );

    setSessionCookie(res, token);

    res.json({
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil },
    });
  } catch (err) {
    next(err);
  }
}

export function logout(_req, res) {
  clearSessionCookie(res);
  res.status(204).end();
}

export async function me(req, res, next) {
  try {
    const row = await queryOne(
      'SELECT id, nome, email, perfil, ativo FROM usuarios WHERE id = ?',
      [req.user.id],
    );
    if (!row) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(mapRow(row));
  } catch (err) {
    next(err);
  }
}

export async function listUsuarios(req, res, next) {
  try {
    const rows = await query(
      'SELECT id, nome, email, perfil, ativo, criado_em FROM usuarios ORDER BY nome ASC',
    );
    res.json(mapRows(rows));
  } catch (err) {
    next(err);
  }
}

export async function createUsuario(req, res, next) {
  try {
    const { nome, email, senha, perfil } = req.body;
    const senhaHash = await bcrypt.hash(senha, 10);
    const result = await query(
      'INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES (?, ?, ?, ?)',
      [nome, email, senhaHash, perfil ?? 'funcionario'],
    );
    const row = await queryOne(
      'SELECT id, nome, email, perfil, ativo FROM usuarios WHERE id = ?',
      [result.insertId],
    );
    res.status(201).json(mapRow(row));
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'E-mail já cadastrado' });
    }
    next(err);
  }
}

export async function updateUsuario(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { nome, email, senha, perfil, ativo } = req.body;

    if (id === req.user.id && ativo === false) {
      return res.status(400).json({ error: 'Você não pode desativar seu próprio usuário' });
    }

    if (senha) {
      const senhaHash = await bcrypt.hash(senha, 10);
      await query(
        'UPDATE usuarios SET nome = ?, email = ?, senha_hash = ?, perfil = ?, ativo = ? WHERE id = ?',
        [nome, email, senhaHash, perfil, ativo ? 1 : 0, id],
      );
    } else {
      await query(
        'UPDATE usuarios SET nome = ?, email = ?, perfil = ?, ativo = ? WHERE id = ?',
        [nome, email, perfil, ativo ? 1 : 0, id],
      );
    }

    const row = await queryOne(
      'SELECT id, nome, email, perfil, ativo FROM usuarios WHERE id = ?',
      [id],
    );
    res.json(mapRow(row));
  } catch (err) {
    next(err);
  }
}
