# 📊 Diagrama de Entidade-Relacionamento (ER)

## Visão Geral da Estrutura do Banco de Dados

### 🔐 Módulo de Autenticação

```
┌─────────────┐
│    Users    │
├─────────────┤
│ id (PK)     │
│ nome        │
│ email       │
│ senha       │
│ ativo       │
└──────┬──────┘
       │ M:N
       ├──────────────┐
       │              │
┌──────▼──────┐ ┌────▼─────────┐
│ User_Roles  │ │    Roles     │
├─────────────┤ ├──────────────┤
│ user_id(FK) │ │ id (PK)      │
│ role_id(FK) │ │ nome         │
└─────────────┘ │ nivel        │
                └──────┬───────┘
                       │ M:N
                ┌──────▼────────────┐
                │ Role_Permissions  │
                ├───────────────────┤
                │ role_id (FK)      │
                │ permission_id(FK) │
                └──────┬────────────┘
                       │
                ┌──────▼──────────┐
                │  Permissions    │
                ├─────────────────┤
                │ id (PK)         │
                │ modulo          │
                │ recurso         │
                │ acao            │
                └─────────────────┘
```

### 🎫 Módulo de Chamados

```
                    ┌──────────────┐
                    │   Chamado    │
                    ├──────────────┤
                    │ id (PK)      │
                    │ numero       │──────┐
                    │ titulo       │      │
                    │ descricao    │      │
                    │ tipo_id (FK) │──┐   │
                    │ status_id(FK)│──┤   │
                    │ prioridade_id│──┤   │
                    │ sla_id (FK)  │──┤   │
                    │ solicitante  │  │   │
                    │ tecnico      │  │   │
                    └──────┬───────┘  │   │
                           │          │   │
        ┌─────────────────┼──────────┘   │
        │                 │              │
┌───────▼──────┐  ┌───────▼────────┐    │ ┌──────────────────┐
│ Chamado_Tipo │  │ Chamado_Status │    │ │ Chamado_Historico│
├──────────────┤  ├────────────────┤    │ ├──────────────────┤
│ id (PK)      │  │ id (PK)        │    └▶│ chamado_id (FK)  │
│ nome         │  │ nome           │      │ usuario_id (FK)  │
│ sla_padrao_id│  │ tipo           │      │ tipo             │
│ area_id      │  │ pausa_sla      │      │ descricao        │
└──────────────┘  └────────────────┘      └──────────────────┘

┌──────────────────┐       ┌────────────┐       ┌─────────┐
│Chamado_Prioridade│       │    SLA     │       │  Areas  │
├──────────────────┤       ├────────────┤       ├─────────┤
│ id (PK)          │       │ id (PK)    │       │ id (PK) │
│ nome             │       │ nome       │       │ nome    │
│ nivel            │       │ tempo_resp │       │ email   │
│ tempo_resposta   │       │ tempo_res  │       └─────────┘
└──────────────────┘       └────────────┘
```

### 📦 Módulo de Inventário

```
                    ┌──────────────┐
                    │    Ativo     │
                    ├──────────────┤
                    │ id (PK)      │
                    │ codigo       │
                    │ nome         │
                    │ tipo_id (FK) │──┐
                    │ modelo_id(FK)│──┤
                    │ status_id(FK)│──┤
                    │ responsavel  │  │
                    │ localizacao  │  │
                    │ patrimonio   │  │
                    └──────┬───────┘  │
                           │          │
        ┌─────────────────┼──────────┘
        │                 │
┌───────▼──────┐  ┌───────▼────────┐
│ Ativo_Tipo   │  │ Ativo_Modelo   │
├──────────────┤  ├────────────────┤
│ id (PK)      │  │ id (PK)        │
│ nome         │  │ nome           │
│ icone        │  │ fabricante     │
└──────────────┘  │ tipo_id (FK)   │
                  └────────────────┘

┌────────────────┐        ┌──────────────────────────┐
│ Ativo_Status   │        │ Ativo_Historico_Local    │
├────────────────┤        ├──────────────────────────┤
│ id (PK)        │        │ ativo_id (FK)            │
│ nome           │        │ localizacao_anterior(FK) │
│ tipo           │        │ localizacao_nova (FK)    │
│ cor            │        │ responsavel_anterior(FK) │
└────────────────┘        │ responsavel_novo (FK)    │
                          │ data_movimentacao        │
                          └──────────────────────────┘
```

### 💾 Módulo de Software e Licenças

```
┌────────────────┐
│   Software     │
├────────────────┤
│ id (PK)        │
│ nome           │
│ fabricante     │
│ versao         │
│ categoria_id   │──┐
│ tipo_licenca   │  │
└────────┬───────┘  │
         │          │
         │ 1:N      │
┌────────▼─────────┐│
│    Licenca       ││
├──────────────────┤│
│ id (PK)          ││
│ software_id (FK) ││
│ chave            ││
│ tipo_licenca_id  │┼──┐
│ qtd_licencas     ││  │
│ em_uso           ││  │
│ data_expiracao   ││  │
└──────────────────┘│  │
                    │  │
    ┌───────────────┘  │
    │                  │
┌───▼─────────────┐ ┌──▼──────────────┐
│Software_Categoria│ │  Tipo_Licenca  │
├──────────────────┤ ├─────────────────┤
│ id (PK)          │ │ id (PK)         │
│ nome             │ │ nome            │
└──────────────────┘ └─────────────────┘
```

### 👥 Módulo de Clientes

```
┌─────────────┐
│   Cliente   │
├─────────────┤
│ id (PK)     │
│ nome        │
│ cnpj        │
│ tipo_id     │
│ status_id   │
└──────┬──────┘
       │ 1:N
       │
┌──────▼──────┐
│  Unidade    │
├─────────────┤
│ id (PK)     │
│ cliente_id  │
│ nome        │
│ endereco    │
│ responsavel │
└──────┬──────┘
       │ 1:N
       │
┌──────▼────────┐
│ Departamento  │
├───────────────┤
│ id (PK)       │
│ unidade_id    │
│ nome          │
│ responsavel   │
└──────┬────────┘
       │ 1:N
       │
┌──────▼──────────┐
│ Centro_Custo    │
├─────────────────┤
│ id (PK)         │
│ departamento_id │
│ codigo          │
│ nome            │
└─────────────────┘
```

## Relacionamentos Principais

### Cardinalidade

- **Users** ↔ **Roles**: Muitos para Muitos (M:N)
- **Roles** ↔ **Permissions**: Muitos para Muitos (M:N)
- **Chamado** → **User (Solicitante)**: Muitos para Um (M:1)
- **Chamado** → **User (Técnico)**: Muitos para Um (M:1)
- **Chamado** → **Chamado_Tipo**: Muitos para Um (M:1)
- **Chamado** → **Chamado_Status**: Muitos para Um (M:1)
- **Chamado** ↔ **Chamado_Historico**: Um para Muitos (1:N)
- **Ativo** → **Ativo_Tipo**: Muitos para Um (M:1)
- **Ativo** → **User (Responsável)**: Muitos para Um (M:1)
- **Ativo** ↔ **Ativo_Historico_Localizacao**: Um para Muitos (1:N)
- **Cliente** ↔ **Unidade**: Um para Muitos (1:N)
- **Unidade** ↔ **Departamento**: Um para Muitos (1:N)
- **Software** ↔ **Licenca**: Um para Muitos (1:N)

## Tabelas de Auditoria

Todas as tabelas principais possuem campos de auditoria:
- `created_at`: Data de criação
- `updated_at`: Data de atualização
- `deleted_at`: Data de exclusão (soft delete)
- `criado_por`: Usuário que criou
- `atualizado_por`: Usuário que atualizou

## Índices Importantes

Para otimização de performance, foram criados índices em:
- Chaves primárias (automático)
- Chaves estrangeiras (automático)
- Campos de busca frequente (numero, codigo, email, etc.)
- Campos de filtro (status, data, etc.)

## Campos JSONB

Campos flexíveis para extensibilidade:
- `campos_customizados`: Dados dinâmicos por tipo
- `caracteristicas`: Especificações técnicas
- `horarios`: Perfis de jornada
- `opcoes`: Opções de campos select

## Total de Tabelas: 42

- Autenticação: 5 tabelas
- Chamados: 11 tabelas
- Inventário: 10 tabelas
- Software: 4 tabelas
- Clientes: 6 tabelas
- Administração: 6 tabelas
