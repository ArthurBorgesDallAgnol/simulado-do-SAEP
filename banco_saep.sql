-- ═══════════════════════════════════════════════════
-- SAEP — Sistema de Gerenciamento de Tarefas
-- Script de criação do banco de dados
-- Banco: SQLite (compatível com MySQL/PostgreSQL com
--        pequenas adaptações)
-- ═══════════════════════════════════════════════════

-- ─────────────────────────────────────────
-- Tabela: usuarios
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    nome    TEXT    NOT NULL,
    email   TEXT    NOT NULL UNIQUE
);

-- ─────────────────────────────────────────
-- Tabela: tarefas
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tarefas (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario    INTEGER NOT NULL,
    descricao     TEXT    NOT NULL,
    setor         TEXT    NOT NULL,
    prioridade    TEXT    NOT NULL
                          CHECK (prioridade IN ('baixa', 'media', 'alta')),
    data_cadastro TEXT    NOT NULL DEFAULT (date('now')),
    status        TEXT    NOT NULL DEFAULT 'a fazer'
                          CHECK (status IN ('a fazer', 'fazendo', 'pronto')),
    FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- ─────────────────────────────────────────
-- Índices de desempenho
-- ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tarefas_status
    ON tarefas(status);

CREATE INDEX IF NOT EXISTS idx_tarefas_usuario
    ON tarefas(id_usuario);

CREATE INDEX IF NOT EXISTS idx_tarefas_prioridade
    ON tarefas(prioridade);

-- ─────────────────────────────────────────
-- Dados de exemplo (seed)
-- ─────────────────────────────────────────
INSERT OR IGNORE INTO usuarios (nome, email) VALUES
    ('Ana Souza',   'ana@saep.com'),
    ('Bruno Lima',  'bruno@saep.com'),
    ('Carla Melo',  'carla@saep.com');

INSERT OR IGNORE INTO tarefas (id_usuario, descricao, setor, prioridade, status) VALUES
    (1, 'Revisar fórmula do produto X',      'Qualidade',     'alta',   'a fazer'),
    (2, 'Atualizar planilha de estoque',      'Logística',     'media',  'fazendo'),
    (3, 'Treinamento operacional linha 3',    'Produção',      'baixa',  'a fazer'),
    (1, 'Emitir relatório mensal',            'Administrativo','media',  'pronto'),
    (2, 'Inspeção de equipamentos',           'Manutenção',    'alta',   'fazendo');
