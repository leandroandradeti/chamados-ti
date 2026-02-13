# 📊 Diagrama ER Completo - Sistema ITSM + ITAM

## Diagrama Mermaid - Organizado por Domínios

### 🔐 Domínio: SEGURANÇA E AUTENTICAÇÃO

```mermaid
erDiagram
    USERS ||--o{ USER_ROLES : tem
    USERS ||--o{ SESSIONS : possui
    USERS ||--o{ LOGS_ACESSO : registra
    USERS ||--o{ LOGS_SISTEMA : gera
    USERS }o--|| ENTIDADES : pertence
    
    ROLES ||--o{ USER_ROLES : possui
    ROLES ||--o{ ROLE_PERMISSIONS : tem
    
    PERMISSIONS ||--o{ ROLE_PERMISSIONS : vinculado
    
    API_TOKENS }o--|| USERS : pertence

    USERS {
        uuid id PK
        string nome
        string email UK
        string senha
        string cpf UK
        string telefone
        string avatar
        boolean ativo
        timestamp ultimo_acesso
        int tentativas_login
        timestamp bloqueado_ate
        uuid entidade_id FK
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    ROLES {
        uuid id PK
        string nome UK
        text descricao
        int nivel
        boolean ativo
    }
    
    PERMISSIONS {
        uuid id PK
        string modulo
        string recurso
        string acao
        text descricao
    }
    
    SESSIONS {
        uuid id PK
        uuid usuario_id FK
        string token UK
        string refresh_token
        string ip_address
        text user_agent
        timestamp expires_at
    }
    
    LOGS_ACESSO {
        uuid id PK
        uuid usuario_id FK
        string ip_address
        string acao
        boolean sucesso
        jsonb detalhes
        timestamp created_at
    }
```

### 🏢 Domínio: EMPRESAS E MULTI-TENANT

```mermaid
erDiagram
    ENTIDADES ||--o{ ENTIDADES : matriz-filial
    ENTIDADES ||--o{ EMPRESAS_CONFIGURACOES : possui
    ENTIDADES ||--o{ USERS : tem
    ENTIDADES ||--o{ CLIENTES : atende
    ENTIDADES ||--o{ CHAMADOS : gerencia
    ENTIDADES ||--o{ ATIVOS : possui

    ENTIDADES {
        uuid id PK
        string nome
        string razao_social
        string cnpj UK
        uuid matriz_id FK
        text endereco
        string telefone
        string email
        string logo
        boolean ativo
    }
    
    EMPRESAS_CONFIGURACOES {
        uuid id PK
        uuid entidade_id FK
        string chave
        text valor
        string tipo
        string categoria
    }
```

### 👥 Domínio: CLIENTES E ESTRUTURA ORGANIZACIONAL

```mermaid
erDiagram
    CLIENTES ||--o{ UNIDADES : possui
    CLIENTES }o--|| CLIENTE_TIPOS : tem
    CLIENTES }o--|| CLIENTE_STATUS : possui
    CLIENTES }o--|| ENTIDADES : pertence
    
    UNIDADES ||--o{ DEPARTAMENTOS : contem
    UNIDADES }o--|| USERS : responsavel
    
    DEPARTAMENTOS ||--o{ CENTROS_CUSTO : possui
    DEPARTAMENTOS }o--|| USERS : responsavel
    
    CENTROS_CUSTO }o--|| DEPARTAMENTOS : pertence

    CLIENTES {
        uuid id PK
        string nome
        string tipo_pessoa
        string cpf_cnpj UK
        string email
        string telefone
        text endereco
        uuid tipo_id FK
        uuid status_id FK
        uuid entidade_id FK
        jsonb campos_customizados
    }
    
    UNIDADES {
        uuid id PK
        uuid cliente_id FK
        string nome
        string codigo
        text endereco
        string telefone
        uuid responsavel_id FK
    }
    
    DEPARTAMENTOS {
        uuid id PK
        uuid unidade_id FK
        string nome
        string codigo
        uuid responsavel_id FK
    }
    
    CENTROS_CUSTO {
        uuid id PK
        uuid departamento_id FK
        string nome
        string codigo
        decimal orcamento_mensal
    }
```

### 🎫 Domínio: CHAMADOS (TICKETS)

```mermaid
erDiagram
    CHAMADOS }o--|| CHAMADO_TIPOS : tem
    CHAMADOS }o--|| CHAMADO_STATUS : possui
    CHAMADOS }o--|| CHAMADO_PRIORIDADES : tem
    CHAMADOS }o--|| SLAS : vinculado
    CHAMADOS }o--|| USERS : solicitante
    CHAMADOS }o--|| USERS : tecnico
    CHAMADOS }o--|| AREAS_ATENDIMENTO : area
    CHAMADOS }o--|| CLIENTES : cliente
    CHAMADOS }o--|| UNIDADES : unidade
    CHAMADOS }o--|| ENTIDADES : pertence
    
    CHAMADOS ||--o{ CHAMADO_HISTORICO : historico
    CHAMADOS ||--o{ CHAMADO_COMENTARIOS : comentarios
    CHAMADOS ||--o{ CHAMADO_ANEXOS : anexos
    CHAMADOS ||--o{ CHAMADO_TAGS : tags
    CHAMADOS ||--o{ CHAMADOS_RELACIONADOS : origem
    CHAMADOS ||--o{ CHAMADOS_RELACIONADOS : destino
    CHAMADOS ||--o{ CHAMADOS_VINCULOS_ATIVO : vinculos
    CHAMADOS ||--o{ CHAMADO_CHECKLIST_EXECUCAO : checklist
    CHAMADOS ||--o{ ROTEIRO_EXECUCAO : roteiros
    CHAMADOS ||--o{ SLA_EVENTOS : eventos
    
    CHAMADO_TIPOS ||--o{ CHAMADOS_CHECKLIST : templates
    CHAMADO_TIPOS ||--o{ SOLUCOES_PADRAO : solucoes
    CHAMADO_TIPOS ||--o{ ROTEIROS_ATENDIMENTO : roteiros
    
    TAGS }o--o{ CHAMADOS : vinculados

    CHAMADOS {
        uuid id PK
        int numero UK
        string titulo
        text descricao
        uuid tipo_id FK
        uuid status_id FK
        uuid prioridade_id FK
        uuid sla_id FK
        uuid solicitante_id FK
        uuid tecnico_responsavel_id FK
        uuid area_id FK
        uuid cliente_id FK
        uuid unidade_id FK
        uuid entidade_id FK
        timestamp data_abertura
        timestamp data_vencimento_sla
        timestamp data_primeira_resposta
        timestamp data_resolucao
        timestamp data_fechamento
        int satisfacao_avaliacao
        text satisfacao_comentario
        jsonb campos_customizados
    }
    
    CHAMADO_HISTORICO {
        uuid id PK
        uuid chamado_id FK
        uuid usuario_id FK
        string acao
        text descricao
        jsonb alteracoes
        timestamp created_at
    }
    
    CHAMADO_COMENTARIOS {
        uuid id PK
        uuid chamado_id FK
        uuid usuario_id FK
        text comentario
        boolean interno
        timestamp created_at
    }
    
    CHAMADO_ANEXOS {
        uuid id PK
        uuid chamado_id FK
        uuid usuario_id FK
        string nome_arquivo
        string caminho_arquivo
        bigint tamanho_bytes
        string tipo_mime
        text descricao
    }
    
    CHAMADOS_RELACIONADOS {
        uuid id PK
        uuid chamado_origem_id FK
        uuid chamado_destino_id FK
        string tipo_relacao
        text descricao
    }
    
    CHAMADOS_VINCULOS_ATIVO {
        uuid id PK
        uuid chamado_id FK
        uuid ativo_id FK
        string tipo_vinculo
        text descricao
    }
```

### ⏱️ Domínio: SLA (Service Level Agreement)

```mermaid
erDiagram
    SLAS }o--|| PERFIS_JORNADA : usa
    SLAS ||--o{ SLA_REGRAS : regras
    SLAS ||--o{ SLA_EVENTOS : eventos
    
    PERFIS_JORNADA ||--o{ CALENDARIO_SLA : horarios
    PERFIS_JORNADA ||--o{ FERIADOS : feriados

    SLAS {
        uuid id PK
        string nome
        text descricao
        int tempo_resposta_horas
        int tempo_resolucao_horas
        int tempo_fechamento_horas
        uuid perfil_jornada_id FK
        boolean ativo
    }
    
    SLA_REGRAS {
        uuid id PK
        uuid sla_id FK
        string nome
        int ordem
        jsonb condicoes
        int tempo_resposta_minutos
        int tempo_resolucao_minutos
        boolean ativo
    }
    
    SLA_EVENTOS {
        uuid id PK
        uuid chamado_id FK
        uuid sla_id FK
        string tipo_evento
        string status
        timestamp tempo_previsto
        timestamp tempo_real
        int tempo_pausado_minutos
        decimal percentual_cumprimento
    }
    
    CALENDARIO_SLA {
        uuid id PK
        uuid perfil_jornada_id FK
        int dia_semana
        time hora_inicio
        time hora_fim
        boolean ativo
    }
```

### 🎯 Domínio: ÁREAS E GRUPOS

```mermaid
erDiagram
    AREAS_ATENDIMENTO ||--o{ CHAMADOS : atende
    AREAS_ATENDIMENTO ||--o{ GRUPOS_TECNICOS : possui
    AREAS_ATENDIMENTO ||--o{ FILAS_CHAMADOS : filas
    
    GRUPOS_TECNICOS }o--|| AREAS_ATENDIMENTO : pertence
    GRUPOS_TECNICOS }o--|| USERS : responsavel
    GRUPOS_TECNICOS }o--o{ USERS : membros
    
    GRUPO_TECNICO_USUARIOS }o--|| GRUPOS_TECNICOS : grupo
    GRUPO_TECNICO_USUARIOS }o--|| USERS : usuario

    AREAS_ATENDIMENTO {
        uuid id PK
        string nome
        text descricao
        uuid responsavel_id FK
        string email
        boolean ativo
    }
    
    GRUPOS_TECNICOS {
        uuid id PK
        string nome UK
        text descricao
        uuid area_id FK
        uuid responsavel_id FK
        string email
        boolean ativo
    }
    
    FILAS_CHAMADOS {
        uuid id PK
        string nome
        text descricao
        uuid area_id FK
        uuid grupo_id FK
        jsonb criterios
        int ordem
        string cor
        boolean ativo
    }
    
    DISTRIBUICAO_AUTOMATICA {
        uuid id PK
        string nome
        boolean ativo
        int prioridade
        jsonb condicoes
        string acao_tipo
        jsonb acao_valor
    }
```

### 💻 Domínio: INVENTÁRIO DE ATIVOS

```mermaid
erDiagram
    ATIVOS }o--|| ATIVO_TIPOS : tipo
    ATIVOS }o--|| ATIVO_MODELOS : modelo
    ATIVOS }o--|| ATIVO_CATEGORIAS : categoria
    ATIVOS }o--|| ATIVO_STATUS : status
    ATIVOS }o--|| UNIDADES : localizacao_atual
    ATIVOS }o--|| USERS : responsavel
    ATIVOS }o--|| CLIENTES : cliente
    ATIVOS }o--|| ENTIDADES : pertence
    ATIVOS }o--|| FABRICANTES : fabricante
    ATIVOS }o--|| FORNECEDORES : fornecedor
    
    ATIVOS ||--o{ ATIVO_HISTORICO_LOCALIZACAO : historico
    ATIVOS ||--o{ TERMOS_RESPONSABILIDADE : termos
    ATIVOS ||--o{ ATIVO_GARANTIAS : garantias
    ATIVOS ||--o{ RELACIONAMENTOS_ATIVOS : origem
    ATIVOS ||--o{ RELACIONAMENTOS_ATIVOS : destino
    ATIVOS ||--o{ CHAMADOS_VINCULOS_ATIVO : chamados
    
    ATIVO_MODELOS }o--|| ATIVO_TIPOS : tipo
    ATIVO_CATEGORIAS }o--|| ATIVO_CATEGORIAS : pai

    ATIVOS {
        uuid id PK
        string nome
        string numero_serie UK
        string patrimonio UK
        uuid tipo_id FK
        uuid modelo_id FK
        uuid categoria_id FK
        uuid status_id FK
        uuid localizacao_atual_id FK
        uuid responsavel_id FK
        uuid cliente_id FK
        uuid entidade_id FK
        uuid fabricante_id FK
        uuid fornecedor_id FK
        date data_aquisicao
        decimal valor_aquisicao
        text especificacoes
        jsonb caracteristicas
        jsonb campos_customizados
    }
    
    ATIVO_HISTORICO_LOCALIZACAO {
        uuid id PK
        uuid ativo_id FK
        uuid localizacao_anterior_id FK
        uuid localizacao_nova_id FK
        uuid responsavel_anterior_id FK
        uuid responsavel_novo_id FK
        string motivo
        text observacoes
        timestamp data_movimentacao
    }
    
    TERMOS_RESPONSABILIDADE {
        uuid id PK
        uuid ativo_id FK
        uuid usuario_id FK
        date data_inicio
        date data_fim
        text termo_texto
        string assinatura_digital
        string ip_assinatura
        timestamp data_assinatura
    }
    
    ATIVO_GARANTIAS {
        uuid id PK
        uuid ativo_id FK
        uuid fornecedor_id FK
        date data_inicio
        date data_fim
        text tipo_garantia
        text observacoes
    }
    
    RELACIONAMENTOS_ATIVOS {
        uuid id PK
        uuid ativo_origem_id FK
        uuid ativo_destino_id FK
        string tipo_relacao
        text descricao
        string porta_origem
        string porta_destino
    }
```

### 💾 Domínio: SOFTWARE E LICENÇAS

```mermaid
erDiagram
    SOFTWARES }o--|| SOFTWARE_CATEGORIAS : categoria
    SOFTWARES }o--|| TIPOS_LICENCAS : tipo_licenca
    SOFTWARES ||--o{ LICENCAS : possui
    SOFTWARES ||--o{ INSTALACOES_SOFTWARE : instalacoes
    
    LICENCAS }o--|| SOFTWARES : software
    LICENCAS }o--|| TIPOS_LICENCAS : tipo
    LICENCAS ||--o{ LICENCAS_ATRIBUICOES : atribuicoes
    
    INSTALACOES_SOFTWARE }o--|| ATIVOS : ativo
    INSTALACOES_SOFTWARE }o--|| SOFTWARES : software

    SOFTWARES {
        uuid id PK
        string nome
        string versao
        uuid categoria_id FK
        uuid tipo_licenca_id FK
        string fabricante
        text descricao
        boolean ativo
    }
    
    LICENCAS {
        uuid id PK
        uuid software_id FK
        uuid tipo_licenca_id FK
        string chave_licenca UK
        int quantidade_total
        int quantidade_utilizada
        date data_aquisicao
        date data_expiracao
        decimal valor
        text observacoes
    }
    
    LICENCAS_ATRIBUICOES {
        uuid id PK
        uuid licenca_id FK
        uuid usuario_id FK
        uuid ativo_id FK
        date data_atribuicao
        date data_revogacao
        boolean ativo
    }
    
    INSTALACOES_SOFTWARE {
        uuid id PK
        uuid software_id FK
        uuid ativo_id FK
        string versao_instalada
        date data_instalacao
        string chave_produto
        boolean ativo
    }
```

### 🔧 Domínio: CMDB (Configuration Management Database)

```mermaid
erDiagram
    SERVICOS }o--|| USERS : responsavel
    SERVICOS }o--|| AREAS_ATENDIMENTO : area
    SERVICOS }o--|| SLAS : sla
    
    SERVICOS ||--o{ DEPENDENCIAS_SERVICOS : origem
    SERVICOS ||--o{ DEPENDENCIAS_SERVICOS : destino
    
    DEPENDENCIAS_SERVICOS }o--|| ATIVOS : ativo

    SERVICOS {
        uuid id PK
        string nome
        text descricao
        string tipo
        string criticidade
        string status
        uuid responsavel_id FK
        uuid area_id FK
        string url
        string documentacao_url
        uuid sla_id FK
        decimal disponibilidade_meta
        int tempo_resposta_meta
        jsonb dados_adicionais
    }
    
    DEPENDENCIAS_SERVICOS {
        uuid id PK
        uuid servico_origem_id FK
        uuid servico_destino_id FK
        uuid ativo_id FK
        string tipo_dependencia
        string criticidade
        text descricao
    }
```

### 💡 Domínio: BASE DE CONHECIMENTO

```mermaid
erDiagram
    CONHECIMENTO_CATEGORIAS ||--o{ CONHECIMENTO_CATEGORIAS : subcategorias
    CONHECIMENTO_CATEGORIAS ||--o{ CONHECIMENTO_ARTIGOS : artigos
    
    CONHECIMENTO_ARTIGOS }o--|| CONHECIMENTO_CATEGORIAS : categoria
    CONHECIMENTO_ARTIGOS }o--|| USERS : autor
    CONHECIMENTO_ARTIGOS ||--o{ CONHECIMENTO_COMENTARIOS : comentarios
    
    CONHECIMENTO_COMENTARIOS }o--|| CONHECIMENTO_ARTIGOS : artigo
    CONHECIMENTO_COMENTARIOS }o--|| USERS : usuario

    CONHECIMENTO_CATEGORIAS {
        uuid id PK
        string nome
        text descricao
        uuid pai_id FK
        int ordem
        boolean ativo
    }
    
    CONHECIMENTO_ARTIGOS {
        uuid id PK
        string titulo
        text conteudo
        text resumo
        uuid categoria_id FK
        uuid autor_id FK
        array palavras_chave
        array tags
        boolean publico
        boolean destaque
        int visualizacoes
        int util
        int nao_util
        string status
        timestamp publicado_em
    }
    
    CONHECIMENTO_COMENTARIOS {
        uuid id PK
        uuid artigo_id FK
        uuid usuario_id FK
        text comentario
        boolean aprovado
    }
```

### 📝 Domínio: SOLUÇÕES E ROTEIROS

```mermaid
erDiagram
    SOLUCOES_PADRAO }o--|| CHAMADO_TIPOS : tipo
    SOLUCOES_PADRAO }o--|| USERS : criador
    
    ROTEIROS_ATENDIMENTO }o--|| CHAMADO_TIPOS : tipo
    ROTEIROS_ATENDIMENTO ||--o{ ROTEIRO_PASSOS : passos
    
    ROTEIRO_EXECUCAO }o--|| CHAMADOS : chamado
    ROTEIRO_EXECUCAO }o--|| ROTEIROS_ATENDIMENTO : roteiro
    ROTEIRO_EXECUCAO }o--|| ROTEIRO_PASSOS : passo
    ROTEIRO_EXECUCAO }o--|| USERS : usuario
    
    CHAMADOS_CHECKLIST }o--|| CHAMADO_TIPOS : tipo
    CHAMADO_CHECKLIST_EXECUCAO }o--|| CHAMADOS : chamado
    CHAMADO_CHECKLIST_EXECUCAO }o--|| CHAMADOS_CHECKLIST : checklist

    SOLUCOES_PADRAO {
        uuid id PK
        string titulo
        text descricao
        text solucao
        uuid tipo_id FK
        string categoria
        array palavras_chave
        int visualizacoes
        int util
        int nao_util
        uuid criado_por FK
    }
    
    ROTEIROS_ATENDIMENTO {
        uuid id PK
        string nome
        text descricao
        uuid tipo_id FK
        int ordem
        boolean ativo
    }
    
    ROTEIRO_PASSOS {
        uuid id PK
        uuid roteiro_id FK
        int ordem
        string titulo
        text descricao
        boolean obrigatorio
        int tempo_estimado_minutos
    }
    
    ROTEIRO_EXECUCAO {
        uuid id PK
        uuid chamado_id FK
        uuid roteiro_id FK
        uuid passo_id FK
        uuid usuario_id FK
        boolean concluido
        text observacoes
        int tempo_gasto_minutos
    }
```

### ⚙️ Domínio: ADMINISTRAÇÃO E CONFIGURAÇÕES

```mermaid
erDiagram
    CAMPOS_CUSTOMIZADOS ||--o{ CAMPOS_CUSTOMIZADOS_OPCOES : opcoes
    CAMPOS_CUSTOMIZADOS ||--o{ VALORES_CUSTOMIZADOS : valores
    
    EMAIL_SMTP ||--o{ EMAIL_TEMPLATES : usa
    
    LISTAS_DISTRIBUICAO }o--|| AREAS_ATENDIMENTO : area
    LISTAS_DISTRIBUICAO }o--|| DEPARTAMENTOS : departamento

    CAMPOS_CUSTOMIZADOS {
        uuid id PK
        string nome
        string tipo
        string entidade_tipo
        jsonb configuracoes
        boolean obrigatorio
        int ordem
        boolean ativo
    }
    
    CAMPOS_CUSTOMIZADOS_OPCOES {
        uuid id PK
        uuid campo_id FK
        string valor
        string label
        int ordem
        string cor
        boolean ativo
    }
    
    VALORES_CUSTOMIZADOS {
        uuid id PK
        uuid campo_id FK
        string entidade_tipo
        uuid entidade_id
        text valor
    }
    
    CONFIGURACOES_SISTEMA {
        uuid id PK
        string chave UK
        text valor
        string tipo
        string categoria
        text descricao
        boolean editavel
    }
    
    EMAIL_SMTP {
        uuid id PK
        string nome
        string host
        int porta
        string seguranca
        string usuario
        string senha
        string remetente_email
        boolean ativo
        boolean padrao
    }
    
    EMAIL_TEMPLATES {
        uuid id PK
        string codigo UK
        string nome
        string assunto
        text corpo
        jsonb variaveis_disponiveis
        string tipo
        boolean ativo
    }
    
    LISTAS_DISTRIBUICAO {
        uuid id PK
        string nome
        text descricao
        array emails
        string tipo
        uuid area_id FK
        uuid departamento_id FK
        boolean ativo
    }
```

### 📊 Domínio: LOGS E AUDITORIA

```mermaid
erDiagram
    LOGS_SISTEMA }o--|| USERS : usuario
    
    API_TOKENS }o--|| USERS : usuario

    LOGS_SISTEMA {
        uuid id PK
        uuid usuario_id FK
        string modulo
        string acao
        string entidade_tipo
        uuid entidade_id
        jsonb dados_anteriores
        jsonb dados_novos
        string ip
        string user_agent
        timestamp created_at
    }
    
    API_TOKENS {
        uuid id PK
        uuid usuario_id FK
        string nome
        string token UK
        text descricao
        array permissoes
        date data_expiracao
        timestamp ultimo_uso
        boolean ativo
    }
```

## Estatísticas do Banco de Dados

### 📈 Resumo por Domínio

| Domínio | Tabelas | Descrição |
|---------|---------|-----------|
| **Segurança** | 7 | Autenticação, permissões, logs de acesso |
| **Empresas** | 2 | Multi-tenant, configurações por empresa |
| **Clientes** | 6 | Clientes, unidades, departamentos, centros de custo |
| **Chamados** | 18 | Tickets, histórico, anexos, tags, relacionamentos |
| **SLA** | 6 | Service Level Agreement, eventos, calendário |
| **Áreas e Grupos** | 5 | Áreas de atendimento, grupos técnicos, filas |
| **Inventário** | 12 | Ativos, tipos, modelos, movimentações, garantias |
| **Software** | 6 | Softwares, licenças, instalações, atribuições |
| **CMDB** | 3 | Serviços, dependências, relacionamentos |
| **Conhecimento** | 3 | Base de conhecimento, artigos, comentários |
| **Soluções** | 6 | Soluções padrão, roteiros, checklist |
| **Administração** | 8 | Configurações, campos customizados, emails |

### 🔢 Totais

- **Total de Tabelas**: 82
- **Relacionamentos N:N**: 8
- **Relacionamentos 1:N**: 150+
- **Auto-relacionamentos**: 4 (entidades, categorias, serviços)
- **Tabelas com Soft Delete**: 45+
- **Índices Criados**: 100+
- **Views de Relatórios**: 7
- **Triggers**: 2 (timestamp, audit log)

### 🔑 Chaves e Constraints

- **Primary Keys**: UUID em todas as tabelas
- **Foreign Keys**: 200+ relações
- **Unique Keys**: 30+
- **Check Constraints**: 15+
- **Default Values**: Todos os timestamps, booleans, arrays

### 📊 Campos Padrão em Todas as Tabelas

```sql
id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
deleted_at TIMESTAMP (soft delete)
criado_por UUID (auditoria)
atualizado_por UUID (auditoria)
```

### 🎯 Campos JSONB para Flexibilidade

- **chamados.campos_customizados**
- **ativos.caracteristicas**
- **distribuicao_automatica.condicoes**
- **filas_chamados.criterios**
- **sla_regras.condicoes**
- **servicos.dados_adicionais**
- **email_templates.variaveis_disponiveis**

### 🔍 Índices Principais

- Email de usuários
- Número de chamados
- Número de série de ativos
- Token de sessão
- Status e prioridades
- Datas de SLA
- Relacionamentos (origem/destino)
- Logs por usuário e data

### 📌 Views Estratégicas

1. **vw_chamados_completo** - Chamados com todas as informações
2. **vw_chamados_estatisticas_status** - Estatísticas por status
3. **vw_tecnicos_performance** - Performance de técnicos
4. **vw_ativos_resumo** - Resumo de ativos por status/tipo
5. **vw_licencas_vencendo** - Licenças próximas do vencimento
6. **vw_inventario_localizacao** - Inventário por localização
7. **vw_chamados_sla_risco** - Chamados em risco de SLA

## 🔄 Relacionamentos Complexos

### Multi-Tenancy (Isolamento por Empresa)

```
ENTIDADES (empresa)
    ↓
    ├── USERS (usuários da empresa)
    ├── CLIENTES (clientes da empresa)
    ├── CHAMADOS (chamados da empresa)
    └── ATIVOS (ativos da empresa)
```

### Hierarquia de Clientes

```
CLIENTES
    ↓
UNIDADES (filiais, lojas)
    ↓
DEPARTAMENTOS (TI, RH, Vendas)
    ↓
CENTROS_CUSTO (projetos, contratos)
```

### Fluxo de Chamado

```
CHAMADO criado
    ↓
DISTRIBUICAO_AUTOMATICA → atribui grupo/técnico
    ↓
GRUPOS_TECNICOS → técnicos especializados
    ↓
SLA_EVENTOS → monitora prazos
    ↓
CHAMADO_HISTORICO → registra todas ações
    ↓
CHAMADO resolvido/fechado
```

### CMDB - Relacionamentos de Infraestrutura

```
SERVICOS (aplicação web)
    ↓ depende de
SERVICOS (banco de dados)
    ↓ hospedado em
ATIVOS (servidor físico)
    ↓ conectado a
ATIVOS (switch de rede)
```

## 💡 Casos de Uso Práticos

### 1. Abrir Chamado Completo

```sql
-- Inserir chamado
INSERT INTO chamados (...) VALUES (...);

-- Adicionar tags
INSERT INTO chamado_tags (chamado_id, tag_id) VALUES (...);

-- Vincular ativos afetados
INSERT INTO chamados_vinculos_ativo (chamado_id, ativo_id) VALUES (...);

-- Anexar arquivos
INSERT INTO chamado_anexos (chamado_id, ...) VALUES (...);

-- Registrar no histórico
INSERT INTO chamado_historico (...) VALUES (...);

-- Criar eventos de SLA
INSERT INTO sla_eventos (...) VALUES (...);
```

### 2. Movimentar Ativo

```sql
-- Atualizar ativo
UPDATE ativos 
SET localizacao_atual_id = :nova_localizacao,
    responsavel_id = :novo_responsavel
WHERE id = :ativo_id;

-- Registrar histórico
INSERT INTO ativo_historico_localizacao (...) VALUES (...);

-- Criar termo de responsabilidade
INSERT INTO termos_responsabilidade (...) VALUES (...);
```

### 3. Consultar Performance de Técnico

```sql
SELECT * FROM vw_tecnicos_performance
WHERE tecnico_id = :id;
```

### 4. Alertar Licenças Vencendo

```sql
SELECT * FROM vw_licencas_vencendo
WHERE dias_para_vencer <= 30;
```

## 🎨 Cores e Status Padrão

### Status de Chamados

- 🟠 **Aberto** - #FF9800
- 🔵 **Em Andamento** - #2196F3
- 🟡 **Aguardando** - #FFC107
- 🟢 **Resolvido** - #4CAF50
- ⚫ **Fechado** - #9E9E9E
- 🔴 **Cancelado** - #F44336

### Prioridades

- 🔴 **Crítica** - #F44336 (1h)
- 🟠 **Alta** - #FF9800 (4h)
- 🟡 **Média** - #FFC107 (8h)
- 🟢 **Baixa** - #4CAF50 (24h)

### Status de Ativos

- 🟢 **Disponível** - #4CAF50
- 🔵 **Em Uso** - #2196F3
- 🟠 **Manutenção** - #FF9800
- ⚫ **Estoque** - #9E9E9E
- 🔴 **Baixado** - #F44336
- 🟡 **Emprestado** - #FFC107

---

**Versão**: 1.2.0  
**Última Atualização**: 2026-02-13  
**Total de Entidades**: 82  
**Complexidade**: Enterprise-Grade
