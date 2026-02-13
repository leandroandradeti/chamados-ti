-- =============================================
-- Sistema de Gestão de Chamados e Inventário
-- Script de Criação do Banco de Dados
-- PostgreSQL 14+
-- =============================================

-- Criar extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABELAS DE AUTENTICAÇÃO E PERMISSÕES
-- =============================================

-- Usuários
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    telefone VARCHAR(20),
    avatar VARCHAR(500),
    ativo BOOLEAN DEFAULT TRUE,
    ultimo_acesso TIMESTAMP,
    tentativas_login INTEGER DEFAULT 0,
    bloqueado_ate TIMESTAMP,
    token_reset_senha VARCHAR(500),
    token_reset_expira TIMESTAMP,
    criado_por UUID,
    atualizado_por UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Perfis/Roles
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    nivel INTEGER NOT NULL CHECK (nivel BETWEEN 1 AND 5),
    ativo BOOLEAN DEFAULT TRUE,
    criado_por UUID,
    atualizado_por UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Permissões
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    modulo VARCHAR(50) NOT NULL,
    recurso VARCHAR(100) NOT NULL,
    acao VARCHAR(20) NOT NULL,
    descricao VARCHAR(255),
    UNIQUE(modulo, recurso, acao)
);

-- Usuário <-> Role (muitos para muitos)
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role <-> Permission (muitos para muitos)
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE
);

-- =============================================
-- TABELAS DE CLIENTES E ESTRUTURA
-- =============================================

-- Tipos de Cliente
CREATE TABLE cliente_tipos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Status de Cliente
CREATE TABLE cliente_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    cor VARCHAR(20),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Clientes
CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    razao_social VARCHAR(255),
    cnpj VARCHAR(18) UNIQUE,
    tipo_id UUID REFERENCES cliente_tipos(id),
    status_id UUID REFERENCES cliente_status(id),
    email VARCHAR(255),
    telefone VARCHAR(20),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    observacoes TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    criado_por UUID,
    atualizado_por UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Unidades
CREATE TABLE unidades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    codigo VARCHAR(50) UNIQUE,
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    telefone VARCHAR(20),
    responsavel_id UUID REFERENCES users(id),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Departamentos
CREATE TABLE departamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unidade_id UUID NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    codigo VARCHAR(50) UNIQUE,
    responsavel_id UUID REFERENCES users(id),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Centros de Custo
CREATE TABLE centros_custo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    departamento_id UUID NOT NULL REFERENCES departamentos(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =============================================
-- TABELAS DE CHAMADOS
-- =============================================

-- Áreas de Atendimento
CREATE TABLE areas_atendimento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    email VARCHAR(255),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Perfis de Jornada
CREATE TABLE perfis_jornada (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    horarios JSONB DEFAULT '{"segunda": {"inicio": "08:00", "fim": "18:00"}, "terca": {"inicio": "08:00", "fim": "18:00"}, "quarta": {"inicio": "08:00", "fim": "18:00"}, "quinta": {"inicio": "08:00", "fim": "18:00"}, "sexta": {"inicio": "08:00", "fim": "18:00"}, "sabado": null, "domingo": null}',
    fuso_horario VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- SLAs
CREATE TABLE slas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    tempo_primeira_resposta INTEGER NOT NULL,
    tempo_resolucao INTEGER NOT NULL,
    horario_comercial BOOLEAN DEFAULT TRUE,
    considera_feriados BOOLEAN DEFAULT TRUE,
    perfil_jornada_id UUID REFERENCES perfis_jornada(id),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Tipos de Chamado
CREATE TABLE chamado_tipos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    icone VARCHAR(50),
    cor VARCHAR(20),
    sla_padrao_id UUID REFERENCES slas(id),
    area_padrao_id UUID REFERENCES areas_atendimento(id),
    requer_aprovacao BOOLEAN DEFAULT FALSE,
    campos_obrigatorios JSONB DEFAULT '[]',
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Status de Chamado
CREATE TABLE chamado_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('aberto', 'em_andamento', 'aguardando', 'resolvido', 'fechado', 'cancelado')),
    cor VARCHAR(20),
    icone VARCHAR(50),
    pausa_sla BOOLEAN DEFAULT FALSE,
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    status_final BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Prioridades de Chamado
CREATE TABLE chamado_prioridades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    nivel INTEGER NOT NULL,
    cor VARCHAR(20),
    icone VARCHAR(50),
    tempo_resposta_horas INTEGER,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Chamados
CREATE TABLE chamados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero SERIAL UNIQUE,
    titulo VARCHAR(500) NOT NULL,
    descricao TEXT NOT NULL,
    tipo_id UUID NOT NULL REFERENCES chamado_tipos(id),
    status_id UUID NOT NULL REFERENCES chamado_status(id),
    prioridade_id UUID NOT NULL REFERENCES chamado_prioridades(id),
    sla_id UUID REFERENCES slas(id),
    area_id UUID REFERENCES areas_atendimento(id),
    solicitante_id UUID NOT NULL REFERENCES users(id),
    tecnico_responsavel_id UUID REFERENCES users(id),
    cliente_id UUID REFERENCES clientes(id),
    unidade_id UUID REFERENCES unidades(id),
    departamento_id UUID REFERENCES departamentos(id),
    data_abertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atribuicao TIMESTAMP,
    data_primeira_resposta TIMESTAMP,
    data_resolucao TIMESTAMP,
    data_fechamento TIMESTAMP,
    prazo_sla TIMESTAMP,
    tempo_pausado INTEGER DEFAULT 0,
    sla_vencido BOOLEAN DEFAULT FALSE,
    pausado BOOLEAN DEFAULT FALSE,
    motivo_pausa TEXT,
    solucao TEXT,
    origem VARCHAR(20) DEFAULT 'web' CHECK (origem IN ('web', 'email', 'telefone', 'api', 'chat')),
    avaliacao INTEGER CHECK (avaliacao BETWEEN 1 AND 5),
    comentario_avaliacao TEXT,
    campos_customizados JSONB DEFAULT '{}',
    criado_por UUID,
    atualizado_por UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Histórico de Chamados
CREATE TABLE chamado_historico (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chamado_id UUID NOT NULL REFERENCES chamados(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES users(id),
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('criacao', 'atribuicao', 'mudanca_status', 'mudanca_prioridade', 'comentario', 'anexo', 'transferencia', 'escalonamento', 'resolucao', 'fechamento', 'reabertura', 'pausa', 'retomada')),
    descricao TEXT NOT NULL,
    valor_anterior JSONB,
    valor_novo JSONB,
    visivel_solicitante BOOLEAN DEFAULT TRUE,
    tempo_decorrido INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comentários de Chamados
CREATE TABLE chamado_comentarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chamado_id UUID NOT NULL REFERENCES chamados(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES users(id),
    comentario TEXT NOT NULL,
    tipo VARCHAR(20) DEFAULT 'publico' CHECK (tipo IN ('publico', 'interno')),
    editado BOOLEAN DEFAULT FALSE,
    data_edicao TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =============================================
-- TABELAS DE INVENTÁRIO
-- =============================================

-- Tipos de Ativo
CREATE TABLE ativo_tipos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    icone VARCHAR(50),
    campos_obrigatorios JSONB DEFAULT '[]',
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Modelos de Ativo
CREATE TABLE ativo_modelos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    fabricante VARCHAR(100),
    tipo_id UUID NOT NULL REFERENCES ativo_tipos(id),
    especificacoes JSONB DEFAULT '{}',
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Categorias de Ativo
CREATE TABLE ativo_categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    pai_id UUID REFERENCES ativo_categorias(id),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Status de Ativo
CREATE TABLE ativo_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    cor VARCHAR(20),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('disponivel', 'em_uso', 'manutencao', 'estoque', 'baixado', 'emprestado')),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Ativos
CREATE TABLE ativos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(100) NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo_id UUID NOT NULL REFERENCES ativo_tipos(id),
    modelo_id UUID REFERENCES ativo_modelos(id),
    categoria_id UUID REFERENCES ativo_categorias(id),
    status_id UUID NOT NULL REFERENCES ativo_status(id),
    numero_serie VARCHAR(255) UNIQUE,
    numero_patrimonio VARCHAR(100) UNIQUE,
    localizacao_atual_id UUID REFERENCES unidades(id),
    localizacao_anterior_id UUID REFERENCES unidades(id),
    responsavel_id UUID REFERENCES users(id),
    cliente_id UUID REFERENCES clientes(id),
    departamento_id UUID REFERENCES departamentos(id),
    data_aquisicao DATE,
    data_garantia_inicio DATE,
    data_garantia_fim DATE,
    garantia_ativa BOOLEAN DEFAULT FALSE,
    valor_aquisicao DECIMAL(15,2),
    fornecedor VARCHAR(255),
    nota_fiscal VARCHAR(100),
    termo_responsabilidade BOOLEAN DEFAULT FALSE,
    termo_aceito_em TIMESTAMP,
    observacoes TEXT,
    caracteristicas JSONB DEFAULT '{}',
    campos_customizados JSONB DEFAULT '{}',
    ativo BOOLEAN DEFAULT TRUE,
    descontinuado BOOLEAN DEFAULT FALSE,
    criado_por UUID,
    atualizado_por UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Histórico de Localização de Ativos
CREATE TABLE ativo_historico_localizacao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ativo_id UUID NOT NULL REFERENCES ativos(id) ON DELETE CASCADE,
    localizacao_anterior_id UUID REFERENCES unidades(id),
    localizacao_nova_id UUID NOT NULL REFERENCES unidades(id),
    responsavel_anterior_id UUID REFERENCES users(id),
    responsavel_novo_id UUID REFERENCES users(id),
    motivo TEXT,
    data_movimentacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    realizado_por_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABELAS DE SOFTWARE E LICENÇAS
-- =============================================

-- Categorias de Software
CREATE TABLE software_categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Tipos de Licença
CREATE TABLE tipo_licencas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Softwares
CREATE TABLE softwares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    fabricante VARCHAR(255),
    versao VARCHAR(100),
    categoria_id UUID REFERENCES software_categorias(id),
    tipo_licenca_id UUID REFERENCES tipo_licencas(id),
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Licenças
CREATE TABLE licencas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    software_id UUID NOT NULL REFERENCES softwares(id),
    chave_licenca VARCHAR(500),
    tipo_licenca_id UUID NOT NULL REFERENCES tipo_licencas(id),
    quantidade_licencas INTEGER DEFAULT 1,
    em_uso INTEGER DEFAULT 0,
    data_aquisicao DATE,
    data_expiracao DATE,
    valor DECIMAL(15,2),
    fornecedor VARCHAR(255),
    nota_fiscal VARCHAR(100),
    observacoes TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =============================================
-- TABELAS DE ADMINISTRAÇÃO
-- =============================================

-- Feriados
CREATE TABLE feriados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    data DATE NOT NULL,
    tipo VARCHAR(20) DEFAULT 'nacional' CHECK (tipo IN ('nacional', 'estadual', 'municipal')),
    recorrente BOOLEAN DEFAULT FALSE,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Campos Customizados
CREATE TABLE campos_customizados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    modulo VARCHAR(50) NOT NULL,
    entidade_id UUID,
    nome VARCHAR(100) NOT NULL,
    label VARCHAR(255) NOT NULL,
   tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('texto', 'numero', 'data', 'select', 'checkbox', 'textarea', 'arquivo')),
    opcoes JSONB,
    obrigatorio BOOLEAN DEFAULT FALSE,
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Logs do Sistema
CREATE TABLE logs_sistema (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES users(id),
    modulo VARCHAR(50) NOT NULL,
    acao VARCHAR(50) NOT NULL,
    entidade VARCHAR(100),
    entidade_id UUID,
    descricao TEXT NOT NULL,
    ip VARCHAR(45),
    user_agent TEXT,
    dados_antes JSONB,
    dados_depois JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

CREATE INDEX idx_chamados_numero ON chamados(numero);
CREATE INDEX idx_chamados_status ON chamados(status_id);
CREATE INDEX idx_chamados_solicitante ON chamados(solicitante_id);
CREATE INDEX idx_chamados_tecnico ON chamados(tecnico_responsavel_id);
CREATE INDEX idx_chamados_data_abertura ON chamados(data_abertura);
CREATE INDEX idx_chamados_prazo_sla ON chamados(prazo_sla);

CREATE INDEX idx_ativos_codigo ON ativos(codigo);
CREATE INDEX idx_ativos_numero_serie ON ativos(numero_serie);
CREATE INDEX idx_ativos_responsavel ON ativos(responsavel_id);
CREATE INDEX idx_ativos_status ON ativos(status_id);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_logs_usuario ON logs_sistema(usuario_id);
CREATE INDEX idx_logs_criado_em ON logs_sistema(created_at);

-- =============================================
-- DADOS INICIAIS
-- =============================================

-- Inserir perfis padrão
INSERT INTO roles (id, nome, descricao, nivel) VALUES
(uuid_generate_v4(), 'Administrador', 'Acesso total ao sistema', 1),
(uuid_generate_v4(), 'Gestor de Área', 'Gerencia área específica', 2),
(uuid_generate_v4(), 'Técnico', 'Atende chamados', 3),
(uuid_generate_v4(), 'Solicitante', 'Abre chamados', 4),
(uuid_generate_v4(), 'Auditor', 'Visualiza relatórios', 5);

-- Inserir status padrão de chamado
INSERT INTO chamado_status (id, nome, tipo, cor, ordem) VALUES
(uuid_generate_v4(), 'Aberto', 'aberto', '#FF9800', 1),
(uuid_generate_v4(), 'Em Andamento', 'em_andamento', '#2196F3', 2),
(uuid_generate_v4(), 'Aguardando Cliente', 'aguardando', '#FFC107', 3),
(uuid_generate_v4(), 'Resolvido', 'resolvido', '#4CAF50', 4),
(uuid_generate_v4(), 'Fechado', 'fechado', '#9E9E9E', 5),
(uuid_generate_v4(), 'Cancelado', 'cancelado', '#F44336', 6);

-- Inserir prioridades padrão
INSERT INTO chamado_prioridades (id, nome, nivel, cor, tempo_resposta_horas) VALUES
(uuid_generate_v4(), 'Crítica', 1, '#F44336', 1),
(uuid_generate_v4(), 'Alta', 2, '#FF9800', 4),
(uuid_generate_v4(), 'Média', 3, '#FFC107', 8),
(uuid_generate_v4(), 'Baixa', 4, '#4CAF50', 24);

-- Inserir status padrão de ativo
INSERT INTO ativo_status (id, nome, tipo, cor) VALUES
(uuid_generate_v4(), 'Disponível', 'disponivel', '#4CAF50'),
(uuid_generate_v4(), 'Em Uso', 'em_uso', '#2196F3'),
(uuid_generate_v4(), 'Manutenção', 'manutencao', '#FF9800'),
(uuid_generate_v4(), 'Estoque', 'estoque', '#9E9E9E'),
(uuid_generate_v4(), 'Baixado', 'baixado', '#F44336'),
(uuid_generate_v4(), 'Emprestado', 'emprestado', '#FFC107');

-- =============================================
-- FIM DO SCRIPT
-- =============================================
