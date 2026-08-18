# Banco de dados Stelus

Um único arquivo recria tudo do zero:

```bash
mysql -u root -p < database/setup.sql
```

**Windows (PowerShell):**

```powershell
Get-Content database\setup.sql -Raw | mysql -u root -proot
```

O script faz `DROP DATABASE`, cria todas as tabelas (v1.6) e insere apenas os **dois usuários de login** (admin e funcionário). Demais cadastros são feitos pelo sistema.

## Importar matrizes do backup (.DST)

```powershell
# 1. Extrair nome e pontos dos .DST
node scripts\extrair-matrizes-dst.js _matrizes_import

# 2. Gerar database\matrizes_import.sql (nome + código + pontos juntos)
node scripts\gerar-sql-matrizes.js

# 3. Importar no banco (após setup.sql)
Get-Content database\matrizes_import.sql -Raw | & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -proot stelus_bordados
```

O `matrizes_import.sql` já traz os **pontos corretos** de cada matriz (campo `ST:` do arquivo .DST), junto com nome e código — não precisa script de UPDATE separado.

- **10.812 matrizes** | códigos `2000000012106` em diante
- Nomes repetidos ganham sufixo `(PASTA.TFD)`
- Ajustes finos podem ser feitos na tela **Matrizes** do sistema

> **Docker:** o `setup.sql` só roda na **primeira** criação do volume MySQL. Para resetar no Docker: `docker compose down -v` e depois `docker compose up -d`.
