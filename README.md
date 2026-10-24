# Stelus

Este repositório contém dois aplicativos que podem ser iniciados separadamente:

| Aplicativo | Pasta | Endereço local |
|---|---|---|
| Website público | `site/` | http://localhost:3000 |
| Sistema de gestão | `sistema/` | http://localhost:3001 |

Os comandos abaixo usam PowerShell no Windows. É necessário ter Node.js 20.9 ou superior. O sistema de gestão também precisa de MySQL 8.

Abra o PowerShell **na pasta raiz do repositório clonado** (a pasta que contém `site/` e `sistema/`). Todos os comandos abaixo partem dessa pasta, independentemente de onde ela esteja no seu computador.

## Iniciar somente o website

O website não precisa do MySQL nem da API. Na primeira execução, instale as dependências:

```powershell
npm install --prefix .\site
```

Depois, para iniciar:

```powershell
npm run dev --prefix .\site
```

Acesse http://localhost:3000. Mantenha o terminal aberto enquanto usar o website.

## Iniciar somente o sistema de gestão

O sistema usa três componentes: MySQL, API na porta 4000 e frontend na porta 3001. O website público não precisa estar em execução.

### Preparar o sistema na primeira execução

1. Inicie o MySQL. O script vem configurado para o serviço `MySQL80`:

   ```powershell
   Set-ExecutionPolicy -Scope Process Bypass
   .\scripts\start-mysql.ps1
   ```

   Caso o nome do serviço seja diferente, confira com `Get-Service *mysql*` e ajuste `$serviceName` em `scripts/start-mysql.ps1`.

2. Crie o banco de dados. **Este comando apaga e recria o banco `stelus_bordados`**:

   ```powershell
   Get-Content .\sistema\database\setup.sql -Raw | mysql -u root -p
   ```

   Se `mysql` não estiver no `PATH`, use `& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p` no lugar de `mysql -u root -p`.

3. Crie os arquivos de configuração local:

   ```powershell
   Copy-Item .\sistema\backend\.env.example .\sistema\backend\.env
   Copy-Item .\sistema\frontend\.env.example .\sistema\frontend\.env
   ```

   Ajuste `DATABASE_URL` no arquivo `sistema/backend/.env` com a senha real do MySQL. Configure um valor próprio para `JWT_SECRET`. O frontend já aponta para `http://localhost:4000` no exemplo.

4. Instale as dependências da raiz do sistema, da API e do frontend:

   ```powershell
   npm install --prefix .\sistema
   npm run install:all --prefix .\sistema
   ```

### Iniciar o sistema no dia a dia

Inicie o MySQL se ele ainda não estiver ativo:

```powershell
.\scripts\start-mysql.ps1
```

Em seguida, rode API e frontend juntos em um terminal:

```powershell
npm run dev --prefix .\sistema
```

Acesse http://localhost:3001/login. Para conferir a API, abra http://localhost:4000/api/health. Mantenha o terminal aberto enquanto usar o sistema.

Se preferir terminais separados, execute `npm run dev:backend --prefix .\sistema` e `npm run dev:frontend --prefix .\sistema` na raiz do repositório.

## Banco de dados e Docker

As instruções de schema, reset e importação de arquivos `.DST` estão em [sistema/database/README.md](sistema/database/README.md). A configuração Docker de produção está em `docker-compose.yml` na raiz e usa um banco separado do MySQL local.
