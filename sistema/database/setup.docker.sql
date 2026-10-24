-- ============================================================
-- STELUS — SETUP COMPLETO DO BANCO DE DADOS (arquivo único)
-- ============================================================
-- Versão : 1.6
-- Init Docker (sem DROP). Local: use setup.sql.
--   mysql -u root -p < database/setup.sql
--
-- Windows (PowerShell):
--   Get-Content database\setup.sql -Raw | mysql -u root -proot
--
-- Credenciais após execução:
-- Admin       : admin@stelus.com.br  / admin123  (Luciano Carneiro da silva)
-- Funcionário : funcionario@stelus.com.br / func123
-- ============================================================

-- Docker: o banco já existe (MYSQL_DATABASE). Só tabelas e seeds.
USE stelus_bordados;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- TABELAS
-- ============================================================

CREATE TABLE usuarios (
  id          INT NOT NULL AUTO_INCREMENT,
  nome        VARCHAR(150) NOT NULL,
  email       VARCHAR(150) NOT NULL,
  senha_hash  VARCHAR(255) NOT NULL,
  perfil      ENUM('admin','funcionario') NOT NULL,
  ativo       TINYINT(1) NOT NULL DEFAULT 1,
  criado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_usuarios_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE clientes (
  id              INT NOT NULL AUTO_INCREMENT,
  nome            VARCHAR(150) NOT NULL,
  razao_social    VARCHAR(150) DEFAULT NULL,
  tipo_pessoa     ENUM('fisica','juridica') NOT NULL DEFAULT 'juridica',
  documento       VARCHAR(20) DEFAULT NULL,
  telefone        VARCHAR(20) DEFAULT NULL,
  email           VARCHAR(150) DEFAULT NULL,
  endereco        VARCHAR(255) DEFAULT NULL,
  numero          VARCHAR(20) DEFAULT NULL,
  bairro          VARCHAR(100) DEFAULT NULL,
  cidade          VARCHAR(100) DEFAULT NULL,
  estado          VARCHAR(2) DEFAULT NULL,
  cep             VARCHAR(10) DEFAULT NULL,
  limite_producao INT NOT NULL DEFAULT 50,
  ativo           TINYINT(1) NOT NULL DEFAULT 1,
  criado_em       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  criado_por      INT DEFAULT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_clientes_criado_por FOREIGN KEY (criado_por) REFERENCES usuarios (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE matrizes (
  id          INT NOT NULL AUTO_INCREMENT,
  nome        VARCHAR(150) NOT NULL,
  referencia  VARCHAR(20) DEFAULT NULL,
  qtd_pontos  INT NOT NULL,
  ativo       TINYINT(1) NOT NULL DEFAULT 1,
  criado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  criado_por  INT DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_matrizes_referencia (referencia),
  CONSTRAINT fk_matrizes_criado_por FOREIGN KEY (criado_por) REFERENCES usuarios (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE partes_peca (
  id    INT NOT NULL AUTO_INCREMENT,
  nome  VARCHAR(100) NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uk_partes_peca_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tabela_precos (
  id            INT NOT NULL AUTO_INCREMENT,
  tipo_peca     ENUM('aberta','fechada') NOT NULL,
  categoria     ENUM('producao','nao_producao') NOT NULL,
  valor_por_mil DECIMAL(10,2) NOT NULL,
  vigente_desde DATE NOT NULL,
  criado_em     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE config_empresa (
  id                  INT NOT NULL,
  nome_empresa        VARCHAR(150) NOT NULL,
  razao_social        VARCHAR(200) DEFAULT NULL,
  cnpj                VARCHAR(20) DEFAULT NULL,
  inscricao_estadual  VARCHAR(30) DEFAULT NULL,
  endereco            VARCHAR(255) DEFAULT NULL,
  numero              VARCHAR(20) DEFAULT NULL,
  bairro              VARCHAR(100) DEFAULT NULL,
  cidade              VARCHAR(100) DEFAULT NULL,
  estado              VARCHAR(2) DEFAULT NULL,
  cep                 VARCHAR(10) DEFAULT NULL,
  telefone            VARCHAR(20) DEFAULT NULL,
  email               VARCHAR(150) DEFAULT NULL,
  logomarca_path      VARCHAR(255) DEFAULT NULL,
  banco               VARCHAR(100) DEFAULT NULL,
  agencia             VARCHAR(20) DEFAULT NULL,
  conta               VARCHAR(30) DEFAULT NULL,
  pix                 VARCHAR(100) DEFAULT NULL,
  favorecido          VARCHAR(150) DEFAULT NULL,
  mensagem_cobranca   TEXT DEFAULT NULL,
  prazo_pagamento     VARCHAR(100) DEFAULT NULL,
  observacoes_padrao  TEXT DEFAULT NULL,
  rodape_documento    TEXT DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE cliente_matriz_categoria (
  id                       INT NOT NULL AUTO_INCREMENT,
  cliente_id               INT NOT NULL,
  matriz_id                INT NOT NULL,
  categoria                ENUM('producao','nao_producao') NOT NULL,
  alterado_manualmente     TINYINT(1) NOT NULL DEFAULT 0,
  valor_por_mil            DECIMAL(10,2) DEFAULT NULL,
  preco_alterado_manualmente TINYINT(1) NOT NULL DEFAULT 0,
  atualizado_em            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_cliente_matriz (cliente_id, matriz_id),
  CONSTRAINT fk_cmc_cliente FOREIGN KEY (cliente_id) REFERENCES clientes (id),
  CONSTRAINT fk_cmc_matriz  FOREIGN KEY (matriz_id)  REFERENCES matrizes (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE fechamentos (
  id             INT NOT NULL AUTO_INCREMENT,
  cliente_id     INT NOT NULL,
  periodo_inicio DATE NOT NULL,
  periodo_fim    DATE NOT NULL,
  valor_total    DECIMAL(10,2) NOT NULL,
  status         ENUM('previa','confirmado','pago') NOT NULL DEFAULT 'previa',
  documento_pdf  VARCHAR(255) DEFAULT NULL,
  criado_em      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  criado_por     INT DEFAULT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_fechamentos_cliente FOREIGN KEY (cliente_id) REFERENCES clientes (id),
  CONSTRAINT fk_fechamentos_criado_por FOREIGN KEY (criado_por) REFERENCES usuarios (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE servicos (
  id                         INT NOT NULL AUTO_INCREMENT,
  cliente_id                 INT NOT NULL,
  matriz_id                  INT NOT NULL,
  parte_peca_id              INT NOT NULL,
  usuario_id                 INT NOT NULL,
  atualizado_por             INT DEFAULT NULL,
  tipo_peca                  ENUM('aberta','fechada') NOT NULL,
  quantidade                 INT NOT NULL,
  data_servico               DATE NOT NULL,
  fechado                    TINYINT(1) NOT NULL DEFAULT 0,
  fechamento_id              INT DEFAULT NULL,
  valor_por_mil_aplicado     DECIMAL(10,2) DEFAULT NULL,
  valor_calculado_historico  DECIMAL(10,2) DEFAULT NULL,
  criado_em                  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_servicos_busca (cliente_id, fechado, data_servico),
  CONSTRAINT fk_servicos_cliente        FOREIGN KEY (cliente_id)     REFERENCES clientes (id),
  CONSTRAINT fk_servicos_matriz         FOREIGN KEY (matriz_id)      REFERENCES matrizes (id),
  CONSTRAINT fk_servicos_parte          FOREIGN KEY (parte_peca_id)  REFERENCES partes_peca (id),
  CONSTRAINT fk_servicos_usuario        FOREIGN KEY (usuario_id)     REFERENCES usuarios (id),
  CONSTRAINT fk_servicos_atualizado_por FOREIGN KEY (atualizado_por) REFERENCES usuarios (id),
  CONSTRAINT fk_servicos_fechamento     FOREIGN KEY (fechamento_id)  REFERENCES fechamentos (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE fechamento_itens (
  id                   INT NOT NULL AUTO_INCREMENT,
  fechamento_id        INT NOT NULL,
  servico_id           INT NOT NULL,
  matriz_id            INT NOT NULL,
  matriz_referencia    VARCHAR(20) DEFAULT NULL,
  matriz_nome          VARCHAR(150) NOT NULL,
  qtd_pontos           INT NOT NULL,
  parte_peca_nome      VARCHAR(100) NOT NULL,
  tipo_peca            ENUM('aberta','fechada') NOT NULL,
  quantidade           INT NOT NULL,
  categoria            ENUM('producao','nao_producao') NOT NULL,
  valor_por_mil        DECIMAL(10,2) NOT NULL,
  valor_calculado      DECIMAL(10,2) NOT NULL,
  categoria_automatica TINYINT(1) NOT NULL DEFAULT 1,
  data_servico         DATE NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_fi_fechamento FOREIGN KEY (fechamento_id) REFERENCES fechamentos (id) ON DELETE CASCADE,
  CONSTRAINT fk_fi_servico    FOREIGN KEY (servico_id)    REFERENCES servicos (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE pagamentos (
  id              INT NOT NULL AUTO_INCREMENT,
  fechamento_id   INT NOT NULL,
  valor_pago      DECIMAL(10,2) NOT NULL,
  data_pagamento  DATE NOT NULL,
  forma_pagamento VARCHAR(50) DEFAULT NULL,
  usuario_id      INT NOT NULL,
  observacao      VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_pagamentos_fechamento FOREIGN KEY (fechamento_id) REFERENCES fechamentos (id),
  CONSTRAINT fk_pagamentos_usuario    FOREIGN KEY (usuario_id)    REFERENCES usuarios (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE auditoria_log (
  id          INT NOT NULL AUTO_INCREMENT,
  usuario_id  INT NOT NULL,
  entidade    VARCHAR(50) NOT NULL,
  entidade_id INT NOT NULL,
  acao        ENUM('criar','editar','excluir','fechar','corrigir') NOT NULL,
  detalhes    JSON DEFAULT NULL,
  criado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_auditoria_entidade (entidade, entidade_id),
  CONSTRAINT fk_auditoria_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- USUÁRIOS (senhas: admin123 / func123)
-- ============================================================

INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES
(
  'Luciano Carneiro da silva',
  'admin@stelus.com.br',
  '$2b$10$JaWg45ZVd.h3sEWwA4udJuiJKiIGHXq71z6k94vGCHki2A/PkXgAO',
  'admin'
),
(
  'Funcionário Demo',
  'funcionario@stelus.com.br',
  '$2b$10$21ZWWZ1fHZ15WY9aaP1JcelF67nJXL/CsiBr5MmvmeJLH44ajYX6i',
  'funcionario'
);

-- ============================================================
-- FIM — demais dados (clientes, matrizes, preços, config) via sistema
-- ============================================================

SELECT 'Setup Stelus v1.6 concluído com sucesso.' AS status;
