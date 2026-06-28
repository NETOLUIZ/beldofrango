# Spec: Sistema de Entregadores — Bel do Frango ATU

**Data:** 2026-06-25  
**Status:** Aprovado

---

## Resumo

Adicionar área do entregador ao sistema Bel do Frango ATU, com:
1. Cadastro de entregadores no painel admin
2. Atribuição de pedidos a entregadores (quando status = SAIU_ENTREGA)
3. Link único por entregador (token UUID fixo) para visualizar entregas e abrir GPS

---

## 1. Modelo de Dados

### Novo model `Entregador` (schema.prisma)

```prisma
model Entregador {
  id        Int      @id @default(autoincrement())
  nome      String
  token     String   @unique @default(uuid())
  ativo     Boolean  @default(true)
  pedidos   Pedido[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Alteração em `Pedido`

Adicionar campo opcional:
```prisma
entregadorId  Int?
entregador    Entregador? @relation(fields: [entregadorId], references: [id], onDelete: SetNull)
```

### Migration

Gerar via `prisma migrate dev --name add_entregador` em dev.  
Em produção: `prisma migrate deploy` (apenas após confirmação explícita do usuário).

---

## 2. Backend — Novas Rotas

### Rotas admin (autenticadas via `autenticarAdmin`)

Montadas em `/api/admin/entregadores` e `/api/admin/pedidos`:

| Método | Rota | Controller | O que faz |
|--------|------|-----------|-----------|
| GET | `/api/admin/entregadores` | `listarAdmin` | Lista todos os entregadores |
| POST | `/api/admin/entregadores` | `criar` | Cria entregador (token gerado automaticamente pelo Prisma via `@default(uuid())`) |
| PUT | `/api/admin/entregadores/:id` | `atualizar` | Edita nome e/ou ativo |
| PUT | `/api/admin/pedidos/:id/entregador` | `atribuirEntregador` | Atribui pedido a entregador (ou remove se `entregadorId: null`) |

### Rota pública

| Método | Rota | Controller | O que faz |
|--------|------|-----------|-----------|
| GET | `/api/entregador/:token` | `buscarPorToken` | Retorna dados do entregador + pedidos SAIU_ENTREGA atribuídos a ele |

**Resposta de `/api/entregador/:token`:**
```json
{
  "entregador": { "id": 1, "nome": "João" },
  "pedidos": [
    {
      "id": 42,
      "nomeCliente": "Maria Silva",
      "endereco": { "rua": "Rua das Flores", "numero": "123", "bairro": "Centro" },
      "itens": [{ "nome": "Frango Grelhado", "quantidade": 2 }],
      "total": 52.90,
      "formaPagamento": "PIX"
    }
  ]
}
```

**Token inválido ou entregador inativo:** `404 { "erro": "Entregador não encontrado" }`

---

## 3. Frontend — Admin (Refatoração + Nova Aba)

### Refatoração geral da AdminPage

- Conectar à API real (hoje usa mock data)
- Visual: Dark Premium + Gold (`#0F0F0F` / `#D4AF37`), Plus Jakarta Sans
- Polling de pedidos a cada 30s

### Navegação por abas

```
[ Pedidos ]  [ Entregadores ]
```

### Aba Pedidos

- Lista pedidos via `GET /api/admin/pedidos`
- Cada card de pedido: cliente, endereço, itens, total, status badge, botão avançar status
- Quando `statusEntrega === 'SAIU_ENTREGA'`: exibe select "Atribuir entregador" com entregadores ativos
- Ao selecionar: chama `PUT /api/admin/pedidos/:id/entregador`

### Aba Entregadores

- Tabela: Nome | Status | Ações
- Botão "Copiar link" → copia `{BASE_URL}/entregador/{token}` para clipboard
- Botão "Novo entregador" → modal com campo nome → `POST /api/admin/entregadores`
- Toggle ativo/inativo → `PUT /api/admin/entregadores/:id`

---

## 4. Frontend — Tela do Entregador (nova)

### Rota

`/entregador/:token` — nova entrada em `routes.ts` e `App.tsx`

### Arquivo

`src/app/entregador/EntregadorPage.tsx`

### Comportamento

1. Ao montar: `GET /api/entregador/:token`
2. Se erro 404: exibe "Link inválido ou expirado. Fale com o restaurante."
3. Se sucesso: exibe nome do entregador + cards de cada pedido

### Card de pedido (mobile-first)

- Nome do cliente
- Endereço completo
- Lista de itens (nome + quantidade)
- Total + forma de pagamento
- Botão "Abrir no Mapa" → `https://www.google.com/maps/dir/?api=1&destination=ENDERECO_ENCODED`

### Visual

- Fundo branco, laranja/vermelho do Bel do Frango
- Mobile-first (entregador usa celular)
- Plus Jakarta Sans
- Touch targets ≥ 44×44px

---

## 5. O que NÃO está no escopo

- Entregador não pode alterar status de pedidos (só admin)
- Sem otimização de rota (cada entrega abre GPS individualmente)
- Sem regenerar token (pode ser adicionado depois)
- Sem notificação push ao entregador

---

## 6. Critérios de Verificação

| O que | Como verificar |
|-------|---------------|
| Migration aplicada | `npx prisma studio` → ver tabela Entregador |
| Criar entregador | `POST /api/admin/entregadores` com cookie de admin |
| Atribuir pedido | `PUT /api/admin/pedidos/1/entregador` → checar no banco |
| Tela entregador | Acessar `/entregador/{token}` no browser mobile |
| GPS abre certo | Clicar "Abrir no Mapa" → Google Maps com endereço correto |
| Token inválido | Acessar `/entregador/token-falso` → mensagem de erro |
