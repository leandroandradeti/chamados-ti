# 🔌 Documentação da API

## Visão Geral

API RESTful para gerenciamento de chamados e inventário.

**Base URL:** `http://localhost:3001/api`

**Formato:** JSON

**Autenticação:** JWT Bearer Token

## Autenticação

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "senha": "senha123"
}
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "nome": "Nome do Usuário",
    "email": "usuario@exemplo.com"
  },
  "roles": [...]
}
```

### Perfil do Usuário
```http
GET /auth/me
Authorization: Bearer {token}
```

### Alterar Senha
```http
POST /auth/alterar-senha
Authorization: Bearer {token}
Content-Type: application/json

{
  "senha_atual": "senha123",
  "senha_nova": "novaSenha456"
}
```

## Chamados

### Listar Chamados
```http
GET /ocorrencias?page=1&limit=20&status=uuid&busca=termo
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (number): Página atual
- `limit` (number): Itens por página
- `status` (uuid): Filtrar por status
- `prioridade` (uuid): Filtrar por prioridade
- `tipo` (uuid): Filtrar por tipo
- `busca` (string): Buscar por título/descrição/número

**Resposta:**
```json
{
  "chamados": [...],
  "total": 150,
  "page": 1,
  "totalPages": 8
}
```

### Buscar Chamado
```http
GET /ocorrencias/:id
Authorization: Bearer {token}
```

### Criar Chamado
```http
POST /ocorrencias
Authorization: Bearer {token}
Content-Type: application/json

{
  "titulo": "Problema no computador",
  "descricao": "Descrição detalhada...",
  "tipo_id": "uuid",
  "prioridade_id": "uuid",
  "cliente_id": "uuid",
  "unidade_id": "uuid"
}
```

### Atribuir Técnico
```http
POST /ocorrencias/:id/atribuir
Authorization: Bearer {token}
Content-Type: application/json

{
  "tecnico_id": "uuid"
}
```

### Resolver Chamado
```http
POST /ocorrencias/:id/resolver
Authorization: Bearer {token}
Content-Type: application/json

{
  "solucao": "Descrição da solução aplicada..."
}
```

### Adicionar Comentário
```http
POST /ocorrencias/:id/comentar
Authorization: Bearer {token}
Content-Type: application/json

{
  "comentario": "Texto do comentário",
  "tipo": "publico"
}
```

### Histórico do Chamado
```http
GET /ocorrencias/:id/historico
Authorization: Bearer {token}
```

## Inventário

### Listar Ativos
```http
GET /inventario?page=1&limit=20&tipo=uuid&busca=termo
Authorization: Bearer {token}
```

### Buscar Ativo
```http
GET /inventario/:id
Authorization: Bearer {token}
```

### Criar Ativo
```http
POST /inventario
Authorization: Bearer {token}
Content-Type: application/json

{
  "codigo": "NB-001",
  "nome": "Notebook Dell",
  "tipo_id": "uuid",
  "status_id": "uuid",
  "numero_serie": "ABC123",
  "numero_patrimonio": "PAT-001",
  "data_aquisicao": "2024-01-15",
  "valor_aquisicao": 3500.00
}
```

### Movimentar Ativo
```http
POST /inventario/:id/movimentar
Authorization: Bearer {token}
Content-Type: application/json

{
  "localizacao_nova_id": "uuid",
  "responsavel_novo_id": "uuid",
  "motivo": "Transferência de setor"
}
```

### Histórico do Ativo
```http
GET /inventario/:id/historico
Authorization: Bearer {token}
```

## Clientes

### Listar Clientes
```http
GET /clientes
Authorization: Bearer {token}
```

### Buscar Cliente
```http
GET /clientes/:id
Authorization: Bearer {token}
```

### Criar Cliente
```http
POST /clientes
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "Empresa XYZ",
  "cnpj": "12.345.678/0001-90",
  "email": "contato@empresa.com",
  "telefone": "(11) 1234-5678"
}
```

### Unidades do Cliente
```http
GET /clientes/:clienteId/unidades
Authorization: Bearer {token}
```

## Administração

### Listar Usuários
```http
GET /admin/usuarios
Authorization: Bearer {token}
```

### Criar Usuário
```http
POST /admin/usuarios
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@empresa.com",
  "senha": "senha123",
  "cpf": "123.456.789-00"
}
```

### Configurações
```http
GET /admin/configuracoes
Authorization: Bearer {token}
```

## API Externa

### Criar Chamado (API Externa)
```http
POST /external/chamados
X-API-Token: {api_token}
Content-Type: application/json

{
  "titulo": "Chamado via API",
  "descricao": "Descrição...",
  "tipo_id": "uuid",
  "prioridade_id": "uuid",
  "solicitante_id": "uuid"
}
```

### Consultar Status
```http
GET /external/chamados/:numero
X-API-Token: {api_token}
```

### Buscar Ativos
```http
GET /external/ativos?codigo=NB-001
X-API-Token: {api_token}
```

## Códigos de Status HTTP

- `200 OK` - Sucesso
- `201 Created` - Recurso criado
- `400 Bad Request` - Dados inválidos
- `401 Unauthorized` - Não autenticado
- `403 Forbidden` - Sem permissão
- `404 Not Found` - Recurso não encontrado
- `409 Conflict` - Conflito (ex: duplicado)
- `500 Internal Server Error` - Erro do servidor

## Formato de Erro

```json
{
  "error": "Mensagem de erro",
  "details": [
    {
      "field": "email",
      "message": "Email já cadastrado"
    }
  ]
}
```

## Rate Limiting

- **Limite:** 100 requisições por 15 minutos por IP
- **Header de resposta:** `X-RateLimit-Remaining`

Quando o limite é excedido:
```json
{
  "error": "Muitas requisições deste IP, tente novamente mais tarde."
}
```

## Paginação

Rotas de listagem suportam paginação:

**Request:**
```http
GET /ocorrencias?page=2&limit=50
```

**Response:**
```json
{
  "data": [...],
  "total": 234,
  "page": 2,
  "totalPages": 5
}
```

## Filtros Avançados

### Busca por múltiplos campos
```http
GET /ocorrencias?busca=computador
```
Busca em: título, descrição e número

### Filtros combinados
```http
GET /ocorrencias?status=uuid&prioridade=uuid&tipo=uuid
```

### Ordenação
```http
GET /ocorrencias?orderBy=created_at&order=DESC
```

## Webhooks (Futuro)

Em desenvolvimento:
- Notificação de novo chamado
- Atualização de status
- SLA vencendo

## Exemplos cURL

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin","senha":"admin"}'
```

### Criar Chamado
```bash
curl -X POST http://localhost:3001/api/ocorrencias \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Teste","descricao":"Descrição","tipo_id":"uuid","prioridade_id":"uuid"}'
```

### Listar Chamados
```bash
curl -X GET "http://localhost:3001/api/ocorrencias?page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGc..."
```

## SDKs e Libraries

Em desenvolvimento:
- JavaScript/TypeScript SDK
- Python SDK
- PHP SDK

## Postman Collection

Importe a collection do Postman: [Download](../postman/chamados-ti.postman_collection.json)

## Changelog da API

### v1.0.0 (2024-02-13)
- ✅ Lançamento inicial
- ✅ Autenticação JWT
- ✅ CRUD de Chamados
- ✅ CRUD de Ativos
- ✅ API Externa

---

**Documentação gerada em:** 13/02/2026
**Versão da API:** v1
