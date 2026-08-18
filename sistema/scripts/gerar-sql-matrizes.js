/**
 * Gera SQL de importação de matrizes a partir do CSV extraído dos .DST
 * Uso: node scripts/gerar-sql-matrizes.js [csv] [saida.sql]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const REFERENCIA_INICIAL = 2000000012106n;
const CRIADO_POR = 1;

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else inQuotes = !inQuotes;
    } else if (ch === ';' && !inQuotes) {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

function sqlEscape(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "''");
}

function truncateNome(nome, max = 150) {
  if (nome.length <= max) return nome;
  return `${nome.slice(0, max - 1)}…`;
}

function uniqueNome(nome, pasta, used) {
  let candidate = truncateNome(nome);
  if (!used.has(candidate)) {
    used.add(candidate);
    return candidate;
  }

  const suffix = ` (${pasta})`;
  candidate = truncateNome(`${nome}${suffix}`);
  if (!used.has(candidate)) {
    used.add(candidate);
    return candidate;
  }

  let n = 2;
  while (n < 1000) {
    candidate = truncateNome(`${nome}${suffix} #${n}`);
    if (!used.has(candidate)) {
      used.add(candidate);
      return candidate;
    }
    n += 1;
  }

  throw new Error(`Não foi possível nome único para: ${nome}`);
}

const csvPath = process.argv[2]
  ?? path.join('_matrizes_import', 'matrizes_extraidas.csv');
const outputPath = process.argv[3]
  ?? path.join('database', 'matrizes_import.sql');

const root = path.resolve(__dirname, '..');
const csvFile = path.isAbsolute(csvPath) ? csvPath : path.join(root, csvPath);
const sqlFile = path.isAbsolute(outputPath) ? outputPath : path.join(root, outputPath);

if (!fs.existsSync(csvFile)) {
  console.error(`CSV não encontrado: ${csvFile}`);
  process.exit(1);
}

const raw = fs.readFileSync(csvFile, 'utf8').replace(/^\uFEFF/, '');
const lines = raw.split(/\r?\n/).filter(Boolean);
const header = lines.shift();
if (!header?.startsWith('nome;')) {
  console.error('CSV inválido — cabeçalho esperado: nome;qtd_pontos;arquivo;pasta');
  process.exit(1);
}

const usedNomes = new Set();
const rows = [];
let skippedZero = 0;
let skippedInvalid = 0;

for (const line of lines) {
  const [nome, qtdPontosStr, , pasta] = parseCsvLine(line);
  const qtdPontos = Number(qtdPontosStr);
  if (!nome?.trim() || !Number.isFinite(qtdPontos)) {
    skippedInvalid += 1;
    continue;
  }
  if (qtdPontos <= 0) {
    skippedZero += 1;
    continue;
  }

  rows.push({
    nome: uniqueNome(nome.trim(), (pasta ?? '').trim() || 'sem-pasta', usedNomes),
    qtdPontos: Math.round(qtdPontos),
  });
}

let ref = REFERENCIA_INICIAL;
const valueLines = rows.map((r) => {
  const referencia = ref.toString();
  ref += 1n;
  return `  ('${sqlEscape(r.nome)}', '${referencia}', ${r.qtdPontos}, 1, ${CRIADO_POR})`;
});

const sql = `-- ============================================================
-- STELUS — Importação de matrizes (gerado automaticamente)
-- Fonte: matrizes_extraidas.csv (${lines.length} linhas no CSV)
-- Pontos: campo ST: do cabeçalho de cada arquivo .DST (Wilcom/Tajima)
-- Inseridas: ${rows.length} | Ignoradas (0 pts): ${skippedZero} | Inválidas: ${skippedInvalid}
-- Duplicados de nome: sufixo com pasta quando necessário
-- ============================================================
-- Executar APÓS setup.sql (usuário admin id=1 deve existir).
-- Nome, código e pontos já vêm corretos neste arquivo — não precisa script de UPDATE.
--
-- Windows:
--   Get-Content database\\matrizes_import.sql -Raw | & "C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe" -u root -proot stelus_bordados
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO matrizes (nome, referencia, qtd_pontos, ativo, criado_por) VALUES
${valueLines.join(',\n')};

SET FOREIGN_KEY_CHECKS = 1;

SELECT COUNT(*) AS total_matrizes FROM matrizes;
`;

fs.mkdirSync(path.dirname(sqlFile), { recursive: true });
fs.writeFileSync(sqlFile, sql, 'utf8');

console.log(`CSV: ${csvFile}`);
console.log(`SQL: ${sqlFile}`);
console.log(`Inseridas: ${rows.length}`);
console.log(`Ignoradas (0 pts): ${skippedZero}`);
console.log(`Inválidas: ${skippedInvalid}`);
console.log(`Referências: ${REFERENCIA_INICIAL} — ${(ref - 1n).toString()}`);
