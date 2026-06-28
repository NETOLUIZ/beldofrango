# Sistema de Entregadores — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar cadastro de entregadores no admin, atribuição de pedidos a entregadores, e tela pública do entregador com lista de entregas + botão GPS.

**Architecture:** Token UUID fixo por entregador gerado pelo Prisma. Admin atribui pedidos SAIU_ENTREGA ao entregador via select. Entregador acessa `entregador.html?token=TOKEN` para ver suas entregas e abrir rotas no Google Maps.

**Tech Stack:** Node.js + Express + Prisma + PostgreSQL (backend) · DC framework com `<x-dc>` e `<script type="text/x-dc">` (frontend) · `fetch` com `credentials:'include'` para admin · fetch simples para tela pública do entregador

---

## Task 1: Schema — model Entregador + campo entregadorId em Pedido

**Files:**
- Modify: `backend/prisma/schema.prisma`

- [ ] **Step 1: Adicionar model Entregador e relação em Pedido**

Abrir `backend/prisma/schema.prisma` e adicionar ao final:

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

Dentro do model `Pedido`, adicionar após `statusEntrega`:

```prisma
  entregadorId   Int?
  entregador     Entregador? @relation(fields: [entregadorId], references: [id], onDelete: SetNull)
```

- [ ] **Step 2: Gerar e aplicar migration**

```bash
cd backend
npx prisma migrate dev --name add_entregador
npx prisma generate
```

Saída esperada: `Your database is now in sync with your schema.`

- [ ] **Step 3: Verificar no Prisma Studio**

```bash
npx prisma studio
```

Confirmar: tabela `Entregador` existe e `Pedido` tem coluna `entregadorId`. Fechar o Studio.

- [ ] **Step 4: Commit**

```bash
git add backend/prisma/schema.prisma backend/prisma/migrations/
git commit -m "feat: adiciona model Entregador e relacao com Pedido"
```

---

## Task 2: Backend — entregadorController.js (CRUD admin + endpoint público)

**Files:**
- Create: `backend/src/controllers/entregadorController.js`

- [ ] **Step 1: Criar o arquivo do controller**

Criar `backend/src/controllers/entregadorController.js` com o seguinte conteúdo:

```js
const { prisma } = require('../utils/db');

/** Lista todos os entregadores — painel admin. */
async function listarAdmin(req, res) {
  try {
    const entregadores = await prisma.entregador.findMany({ orderBy: { nome: 'asc' } });
    res.json(entregadores);
  } catch (err) {
    console.error('Erro ao listar entregadores:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
}

/** Cria um entregador — token UUID gerado automaticamente pelo Prisma. */
async function criar(req, res) {
  try {
    const nome = String(req.body.nome || '').trim();
    if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório' });
    const entregador = await prisma.entregador.create({ data: { nome } });
    res.status(201).json(entregador);
  } catch (err) {
    console.error('Erro ao criar entregador:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
}

/** Atualiza nome e/ou ativo de um entregador. */
async function atualizar(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const dados = {};
    if (req.body.nome !== undefined) dados.nome = String(req.body.nome).trim();
    if (req.body.ativo !== undefined) dados.ativo = Boolean(req.body.ativo);
    const entregador = await prisma.entregador.update({ where: { id }, data: dados });
    res.json(entregador);
  } catch (err) {
    console.error('Erro ao atualizar entregador:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
}

/**
 * Rota pública (sem autenticação) — retorna o entregador e os pedidos
 * SAIU_ENTREGA atribuídos a ele. Usado pela tela do entregador.
 */
async function buscarPorToken(req, res) {
  try {
    const entregador = await prisma.entregador.findFirst({
      where: { token: req.params.token, ativo: true },
    });
    if (!entregador) return res.status(404).json({ erro: 'Entregador não encontrado' });

    const pedidos = await prisma.pedido.findMany({
      where: { entregadorId: entregador.id, statusEntrega: 'SAIU_ENTREGA' },
      include: {
        itens: { include: { produto: true, tamanhoMarmita: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({
      entregador: { id: entregador.id, nome: entregador.nome },
      pedidos: pedidos.map((p) => ({
        id: p.id,
        nomeCliente: p.nomeCliente,
        telefone: p.telefone,
        endereco: p.endereco,
        itens: p.itens.map((it) => ({
          nome: it.produto ? it.produto.nome : it.tamanhoMarmita?.nome,
          quantidade: it.quantidade,
        })),
        total: p.total,
        formaPagamento: p.formaPagamento,
      })),
    });
  } catch (err) {
    console.error('Erro ao buscar entregador por token:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
}

module.exports = { listarAdmin, criar, atualizar, buscarPorToken };
```

- [ ] **Step 2: Testar listarAdmin**

Certifique-se que o backend está rodando (`node src/server.js` dentro de `backend/`). Faça login no admin pelo browser e então:

```bash
# Substituir COOKIE pelo valor do cookie bel_do_frango_atu_admin_token
curl -s http://localhost:3010/api/admin/entregadores \
  -H "Cookie: bel_do_frango_atu_admin_token=COOKIE" | cat
```

Saída esperada: `[]` (array vazio — nenhum entregador ainda)

- [ ] **Step 3: Commit**

```bash
git add backend/src/controllers/entregadorController.js
git commit -m "feat: controller de entregadores (CRUD admin + endpoint publico por token)"
```

---

## Task 3: Backend — atribuirEntregador em pedidoController.js

**Files:**
- Modify: `backend/src/controllers/pedidoController.js`

- [ ] **Step 1: Adicionar função atribuirEntregador**

Abrir `backend/src/controllers/pedidoController.js`. Antes da linha `module.exports = { criar, buscarPorId, listarAdmin, atualizarStatus };`, adicionar:

```js
/** Atribui (ou remove) um entregador de um pedido — painel admin. */
async function atribuirEntregador(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const entregadorId = req.body.entregadorId != null
      ? parseInt(req.body.entregadorId, 10)
      : null;
    const pedido = await prisma.pedido.update({
      where: { id },
      data: { entregadorId },
    });
    res.json(pedido);
  } catch (err) {
    console.error('Erro ao atribuir entregador:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
}
```

- [ ] **Step 2: Exportar a nova função**

Substituir a linha de exports:

```js
module.exports = { criar, buscarPorId, listarAdmin, atualizarStatus, atribuirEntregador };
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/controllers/pedidoController.js
git commit -m "feat: funcao atribuirEntregador no pedidoController"
```

---

## Task 4: Backend — novas rotas em admin.js e server.js

**Files:**
- Modify: `backend/src/routes/admin.js`
- Modify: `backend/src/server.js`

- [ ] **Step 1: Adicionar rotas de entregadores em admin.js**

Abrir `backend/src/routes/admin.js`. Adicionar o require do novo controller após os outros requires:

```js
const entregadorController = require('../controllers/entregadorController');
```

Adicionar as rotas antes de `module.exports = router;`:

```js
router.get('/entregadores', entregadorController.listarAdmin);
router.post('/entregadores', entregadorController.criar);
router.put('/entregadores/:id', entregadorController.atualizar);

const { atribuirEntregador } = require('../controllers/pedidoController');
router.put('/pedidos/:id/entregador', atribuirEntregador);
```

- [ ] **Step 2: Adicionar rota pública do entregador em server.js**

Abrir `backend/src/server.js`. Adicionar o require após os outros requires de rotas:

```js
const { buscarPorToken } = require('./controllers/entregadorController');
```

Adicionar a rota pública após `app.use('/api/admin', adminRoutes);`:

```js
app.get('/api/entregador/:token', limitadorPublico, buscarPorToken);
```

- [ ] **Step 3: Verificar rotas com curl**

Com o backend rodando e cookie válido:

```bash
# Criar entregador
curl -s -X POST http://localhost:3010/api/admin/entregadores \
  -H "Content-Type: application/json" \
  -H "Cookie: bel_do_frango_atu_admin_token=COOKIE" \
  -d '{"nome":"João Motoboy"}' | cat
```

Saída esperada: `{"id":1,"nome":"João Motoboy","token":"UUID-GERADO","ativo":true,...}`

```bash
# Endpoint público (substituir TOKEN pelo token gerado acima)
curl -s http://localhost:3010/api/entregador/TOKEN | cat
```

Saída esperada: `{"entregador":{"id":1,"nome":"João Motoboy"},"pedidos":[]}`

- [ ] **Step 4: Commit**

```bash
git add backend/src/routes/admin.js backend/src/server.js
git commit -m "feat: rotas de entregadores no admin e endpoint publico por token"
```

---

## Task 5: Frontend — Seção Entregadores no Admin (HTML)

**Files:**
- Modify: `Bel do Frango - Admin.dc.html` (template HTML)

- [ ] **Step 1: Adicionar botão Entregadores na sidebar**

Localizar o bloco do botão `goVendas` na sidebar (em torno da linha 109). Adicionar após o botão de Vendas, antes do botão de Trocar senha:

```html
      <button onClick="{{ goEntregadores }}" style="{{ navEntregadores }}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="18" cy="6" r="3" fill="currentColor"/></svg>
        <span style="flex:1;text-align:left;">Entregadores</span>
      </button>
```

- [ ] **Step 2: Adicionar seção Entregadores no main**

Localizar `<!-- ---------- VENDAS & ESTOQUE ---------- -->` e adicionar ANTES dela:

```html
      <!-- ---------- ENTREGADORES ---------- -->
      <sc-if value="{{ isEntregadores }}" hint-placeholder-val="{{ false }}">
      <div style="animation:adIn .25s ease-out;max-width:820px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;">
          <button onClick="{{ novoEntregador }}" style="margin-left:auto;display:flex;align-items:center;gap:8px;background:#6B2E12;color:#FFF3DC;border:none;border-radius:12px;padding:11px 17px;font-weight:700;font-size:14px;cursor:pointer;box-shadow:0 6px 16px rgba(107,46,18,.22);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Novo entregador
          </button>
        </div>

        <sc-if value="{{ isEntregadorDraft }}" hint-placeholder-val="{{ false }}">
          <div style="display:flex;gap:8px;margin-bottom:16px;background:#FFFBF3;border:1px solid rgba(29,16,9,.08);border-radius:14px;padding:14px;">
            <input value="{{ entregadorDraftNome }}" onChange="{{ onEntregadorDraftNome }}" placeholder="Nome do entregador" style="flex:1;border:1px solid rgba(29,16,9,.14);background:#fff;border-radius:10px;padding:10px 13px;font-size:14px;outline:none;"/>
            <button onClick="{{ salvarEntregadorDraft }}" style="background:#2D9E60;color:#fff;border:none;border-radius:10px;padding:10px 16px;font-weight:700;font-size:13px;cursor:pointer;">Salvar</button>
            <button onClick="{{ cancelarEntregadorDraft }}" style="background:none;border:1px solid rgba(29,16,9,.14);color:#6B2E12;border-radius:10px;padding:10px 16px;font-weight:700;font-size:13px;cursor:pointer;">Cancelar</button>
          </div>
        </sc-if>

        <div style="background:#FFFBF3;border:1px solid rgba(29,16,9,.07);border-radius:18px;overflow:hidden;box-shadow:0 5px 16px rgba(29,16,9,.05);">
          <div style="display:grid;grid-template-columns:2fr 2fr 120px;gap:14px;padding:13px 20px;background:#F6F1E7;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#8C8075;">
            <span>Nome</span><span>Link do entregador</span><span style="text-align:right;">Status</span>
          </div>
          <sc-for list="{{ entregadorRows }}" as="e" hint-placeholder-count="3">
            <div style="display:grid;grid-template-columns:2fr 2fr 120px;gap:14px;padding:14px 20px;border-top:1px solid rgba(29,16,9,.06);align-items:center;">
              <div style="font-weight:700;font-size:14px;">{{ e.nome }}</div>
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-family:'DM Mono',monospace;font-size:12px;color:#8C8075;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:240px;">{{ e.linkCurto }}</span>
                <button onClick="{{ e.onCopiarLink }}" title="Copiar link" style="flex:none;background:#FFF3DC;border:1px solid #F2C078;color:#B45309;border-radius:8px;padding:6px 10px;font-weight:700;font-size:12px;cursor:pointer;">Copiar</button>
              </div>
              <div style="display:flex;justify-content:flex-end;"><button onClick="{{ e.onToggle }}" style="{{ e.toggleStyle }}"><span style="{{ e.knobStyle }}"></span></button></div>
            </div>
          </sc-for>
          <sc-if value="{{ entregadoresEmpty }}" hint-placeholder-val="{{ false }}"><div style="padding:46px;text-align:center;color:#8C8075;">Nenhum entregador cadastrado.</div></sc-if>
        </div>
      </div>
      </sc-if>
```

- [ ] **Step 3: Adicionar select de entregador na coluna de ação dos pedidos em rota**

Localizar o bloco `<sc-if value="{{ o.canAdvance }}"` dentro de `orderRows`. Substituir o trecho:

```html
              <div style="display:flex;justify-content:flex-end;">
                <sc-if value="{{ o.canAdvance }}" hint-placeholder-val="{{ false }}"><button onClick="{{ o.onAdvance }}" style="background:#D97706;color:#fff;border:none;border-radius:10px;padding:9px 13px;font-weight:700;font-size:12px;cursor:pointer;white-space:nowrap;">{{ o.advanceLabel }}</button></sc-if>
                <sc-if value="{{ o.isDone }}" hint-placeholder-val="{{ false }}"><span style="display:flex;align-items:center;gap:5px;color:#2D9E60;font-size:12px;font-weight:700;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>{{ o.doneLabel }}</span></sc-if>
              </div>
```

Por:

```html
              <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
                <sc-if value="{{ o.canAdvance }}" hint-placeholder-val="{{ false }}"><button onClick="{{ o.onAdvance }}" style="background:#D97706;color:#fff;border:none;border-radius:10px;padding:9px 13px;font-weight:700;font-size:12px;cursor:pointer;white-space:nowrap;">{{ o.advanceLabel }}</button></sc-if>
                <sc-if value="{{ o.showEntregadorSelect }}" hint-placeholder-val="{{ false }}">
                  <select value="{{ o.entregadorSelecionado }}" onChange="{{ o.onAtribuirEntregador }}" style="border:1px solid rgba(29,16,9,.14);background:#fff;border-radius:9px;padding:7px 10px;font-size:12px;color:#1D1009;cursor:pointer;max-width:148px;">
                    <option value="">— Entregador —</option>
                    <sc-for list="{{ o.entregadorOptions }}" as="opt" hint-placeholder-count="2">
                      <option value="{{ opt.value }}" selected="{{ opt.selected }}">{{ opt.label }}</option>
                    </sc-for>
                  </select>
                </sc-if>
                <sc-if value="{{ o.isDone }}" hint-placeholder-val="{{ false }}"><span style="display:flex;align-items:center;gap:5px;color:#2D9E60;font-size:12px;font-weight:700;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>{{ o.doneLabel }}</span></sc-if>
              </div>
```

- [ ] **Step 4: Commit**

```bash
git add "Bel do Frango - Admin.dc.html"
git commit -m "feat: template HTML da secao Entregadores e select de atribuicao no admin"
```

---

## Task 6: Frontend — Lógica JS da seção Entregadores no Admin

**Files:**
- Modify: `Bel do Frango - Admin.dc.html` (bloco `<script type="text/x-dc">`)

- [ ] **Step 1: Adicionar entregadores ao estado inicial**

Localizar `state = {` no script. Adicionar `entregadores: [],` na lista de estado.

- [ ] **Step 2: Adicionar título e nav de entregadores**

Localizar `const titles = {` e adicionar `entregadores:['Entregadores','Cadastre e gerencie os entregadores do delivery'],` no objeto.

- [ ] **Step 3: Adicionar método carregarEntregadores**

Logo após `async carregarPedidos()`, adicionar:

```js
async carregarEntregadores(){
  const lista = await this.apiGet('/admin/entregadores');
  this.setState({ entregadores: lista });
}
```

- [ ] **Step 4: Chamar carregarEntregadores em carregarTudo**

Localizar `async carregarTudo()`. Adicionar `this.carregarEntregadores()` junto com as outras chamadas paralelas.

- [ ] **Step 5: Adicionar método goEntregadores**

Na função `nav(view)`, o padrão já funciona. Adicionar alias para manter consistência com os outros botões de nav:

```js
goEntregadores(){ this.nav('entregadores'); }
```

- [ ] **Step 6: Adicionar métodos de CRUD de entregadores**

Adicionar após os métodos de banners:

```js
novoEntregador(){ this.setState({ entregadorDraft: { nome: '' } }); }
cancelarEntregadorDraft(){ this.setState({ entregadorDraft: null }); }
onEntregadorDraftNome(e){ this.setState(s => ({ entregadorDraft: { ...s.entregadorDraft, nome: e.target.value } })); }
async salvarEntregadorDraft(){
  const nome = (this.state.entregadorDraft?.nome || '').trim();
  if (!nome){ this.showToast('Informe o nome do entregador'); return; }
  try {
    const novo = await this.apiSend('POST', '/admin/entregadores', { nome });
    this.setState(s => ({ entregadores: [...s.entregadores, novo], entregadorDraft: null }));
    this.showToast('Entregador cadastrado');
  } catch (e) { this.showToast(e.message || 'Erro ao salvar entregador'); }
}
async toggleEntregadorAtivo(id){
  const e = this.state.entregadores.find(x => x.id === id); if (!e) return;
  try {
    const updated = await this.apiSend('PUT', '/admin/entregadores/' + id, { ativo: !e.ativo });
    this.setState(s => ({ entregadores: s.entregadores.map(x => x.id === id ? updated : x) }));
  } catch (err) { this.showToast('Erro ao atualizar entregador'); }
}
async atribuirEntregador(pedidoRawId, entregadorId){
  try {
    await this.apiSend('PUT', '/admin/pedidos/' + pedidoRawId + '/entregador', { entregadorId: entregadorId || null });
    this.setState(s => ({ orders: s.orders.map(o => o.rawId === pedidoRawId ? { ...o, entregadorId: entregadorId || null } : o) }));
    this.showToast(entregadorId ? 'Entregador atribuído' : 'Entregador removido');
  } catch (err) { this.showToast('Erro ao atribuir entregador'); }
}
```

- [ ] **Step 7: Atualizar mapPedido para incluir entregadorId**

Localizar a função `mapPedido(o)`. Adicionar `entregadorId: o.entregadorId || null,` no objeto retornado.

- [ ] **Step 8: Adicionar renderVals para entregadores**

Localizar a seção `return {` do `renderVals()` e adicionar antes do `}` final:

```js
isEntregadores: s.view === 'entregadores',
navEntregadores: navStyle(s.view === 'entregadores'),
goEntregadores:() => this.nav('entregadores'),
novoEntregador:() => this.novoEntregador(),
isEntregadorDraft: !!s.entregadorDraft,
entregadorDraftNome: s.entregadorDraft?.nome || '',
onEntregadorDraftNome:(e) => this.onEntregadorDraftNome(e),
salvarEntregadorDraft:() => this.salvarEntregadorDraft(),
cancelarEntregadorDraft:() => this.cancelarEntregadorDraft(),
entregadoresEmpty: s.entregadores.length === 0,
entregadorRows: s.entregadores.map(e => ({
  nome: e.nome,
  linkCurto: 'entregador.html?token=' + e.token.slice(0, 12) + '...',
  toggleStyle: this.toggleStyle(e.ativo),
  knobStyle: this.knobStyle(),
  onToggle:() => this.toggleEntregadorAtivo(e.id),
  onCopiarLink:() => {
    const url = window.location.origin + '/entregador.html?token=' + e.token;
    navigator.clipboard.writeText(url).then(() => this.showToast('Link copiado!')).catch(() => this.showToast(url));
  }
})),
```

- [ ] **Step 9: Atualizar orderRows para adicionar select de entregador**

Localizar onde `orderRows` é montado em `renderVals()`. Dentro do `.map(o => {...})`, adicionar ao objeto retornado:

```js
showEntregadorSelect: o.status === 'rota',
entregadorSelecionado: String(o.entregadorId || ''),
entregadorOptions: s.entregadores.filter(e => e.ativo).map(e => ({
  value: String(e.id), label: e.nome, selected: String(o.entregadorId) === String(e.id)
})),
onAtribuirEntregador:(ev) => this.atribuirEntregador(o.rawId, ev.target.value ? parseInt(ev.target.value, 10) : null),
```

- [ ] **Step 10: Testar no browser**

1. Abrir `http://localhost:5000/Bel%20do%20Frango%20-%20Admin.dc.html`
2. Navegar para "Entregadores" na sidebar
3. Clicar "Novo entregador", preencher nome, salvar
4. Verificar que o link aparece na tabela
5. Clicar "Copiar" — deve copiar o link para a área de transferência
6. Avançar um pedido até status "rota" — select de entregador deve aparecer na linha

- [ ] **Step 11: Commit**

```bash
git add "Bel do Frango - Admin.dc.html"
git commit -m "feat: logica JS de entregadores no admin (CRUD + atribuicao de pedidos)"
```

---

## Task 7: Frontend — Tela pública do entregador (entregador.html)

**Files:**
- Create: `entregador.html`

- [ ] **Step 1: Criar entregador.html**

Criar o arquivo `entregador.html` na raiz do projeto com o seguinte conteúdo:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Entregas — Bel do Frango</title>
<script src="scripts/support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;}
  body{margin:0;font-family:'DM Sans',system-ui,sans-serif;-webkit-font-smoothing:antialiased;background:#FFF6D6;color:#1D1009;font-size:15px;}
  button:focus-visible,a:focus-visible{outline:2px solid #D62828;outline-offset:2px;}
  button{-webkit-tap-highlight-color:transparent;transition:transform .12s ease;}
  button:active{transform:scale(.96);}
  @keyframes enUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
  @keyframes enRing{to{transform:rotate(360deg);}}
</style>
</helmet>

<!-- CARREGANDO -->
<sc-if value="{{ carregando }}" hint-placeholder-val="{{ true }}">
<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#FFF6D6;">
  <span style="width:34px;height:34px;border:3px solid rgba(181,22,28,.2);border-top-color:#B5161C;border-radius:50%;animation:enRing .7s linear infinite;"></span>
</div>
</sc-if>

<!-- ERRO (token inválido) -->
<sc-if value="{{ hasErro }}" hint-placeholder-val="{{ false }}">
<div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;gap:14px;">
  <div style="width:72px;height:72px;border-radius:50%;background:#FBE3DF;display:flex;align-items:center;justify-content:center;">
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#B5161C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  </div>
  <h2 style="font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:20px;margin:0;color:#B5161C;">Link inválido ou expirado</h2>
  <p style="margin:0;color:#8C8075;font-size:14px;max-width:280px;">Fale com o restaurante para receber um novo link.</p>
</div>
</sc-if>

<!-- ENTREGAS -->
<sc-if value="{{ hasData }}" hint-placeholder-val="{{ false }}">
<div style="max-width:560px;margin:0 auto;padding:0 16px 40px;animation:enUp .28s ease-out;">
  <!-- Header -->
  <div style="background:#D62828;color:#fff;border-radius:0 0 26px 26px;padding:calc(20px + env(safe-area-inset-top)) 20px 22px;margin:0 -16px 24px;text-align:center;">
    <div style="width:52px;height:52px;margin:0 auto 10px;"><img src="assets/logo tranparente.png" alt="Bel do Frango" style="width:100%;height:100%;object-fit:contain;filter:brightness(0) invert(1);"/></div>
    <h1 style="font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:20px;margin:0 0 3px;">Olá, {{ nomeEntregador }}!</h1>
    <p style="margin:0;font-size:13px;color:rgba(255,255,255,.8);">{{ subtituloEntregas }}</p>
  </div>

  <!-- Lista vazia -->
  <sc-if value="{{ semEntregas }}" hint-placeholder-val="{{ false }}">
  <div style="text-align:center;padding:50px 20px;color:#8C8075;">
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#D1C4B6" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="display:block;margin:0 auto 14px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    <p style="font-size:15px;font-weight:600;margin:0;">Nenhuma entrega pendente</p>
    <p style="font-size:13px;margin:4px 0 0;">Aguarde novas atribuições do restaurante.</p>
  </div>
  </sc-if>

  <!-- Cards de entrega -->
  <div style="display:flex;flex-direction:column;gap:14px;">
    <sc-for list="{{ cards }}" as="card" hint-placeholder-count="2">
    <div style="background:#fff;border:1px solid rgba(29,16,9,.07);border-radius:20px;padding:16px;box-shadow:0 6px 18px rgba(29,16,9,.06);">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
        <span style="font-family:'DM Mono',monospace;font-size:12px;font-weight:500;color:#8C8075;">{{ card.idLabel }}</span>
        <span style="margin-left:auto;display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;color:#2563EB;background:#E8EEFC;border:1px solid #BBCDF6;border-radius:8px;padding:3px 9px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Em rota
        </span>
      </div>
      <h2 style="font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:16px;margin:0 0 4px;">{{ card.nomeCliente }}</h2>
      <div style="display:flex;align-items:flex-start;gap:7px;color:#6B2E12;font-size:13px;margin-bottom:10px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex:none;margin-top:2px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        <span>{{ card.enderecoFmt }}</span>
      </div>
      <div style="border-top:1px dashed rgba(29,16,9,.1);padding-top:10px;margin-bottom:12px;">
        <sc-for list="{{ card.itens }}" as="it" hint-placeholder-count="2">
          <div style="font-size:13px;color:#6B2E12;padding:2px 0;">{{ it.label }}</div>
        </sc-for>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
        <span style="font-family:'DM Mono',monospace;font-weight:500;font-size:16px;color:#D62828;">{{ card.totalFmt }}</span>
        <span style="font-size:13px;font-weight:700;color:#6B2E12;">{{ card.pgtoLabel }}</span>
      </div>
      <a href="{{ card.mapsUrl }}" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;justify-content:center;gap:8px;width:100%;background:#D62828;color:#fff;border-radius:14px;padding:14px;font-weight:700;font-size:14px;text-decoration:none;box-shadow:0 8px 20px rgba(214,40,40,.28);">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        Abrir no Mapa
      </a>
    </div>
    </sc-for>
  </div>
</div>
</sc-if>

</x-dc>
<script type="text/x-dc">
class Component extends DCLogic {
  apiBase = 'http://localhost:3010/api';

  state = {
    carregando: true,
    erro: false,
    entregador: null,
    pedidos: [],
  };

  fmt(v){ return 'R$ ' + Number(v).toFixed(2).replace('.', ','); }

  enderecoFmt(e){
    if (!e) return '—';
    const parts = [e.rua, e.numero, e.complemento, e.bairro, e.cidade].filter(Boolean);
    return parts.join(', ');
  }

  enderecoParaMaps(e){
    if (!e) return '';
    const q = [e.rua, e.numero, e.bairro, e.cidade].filter(Boolean).join(', ');
    return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(q);
  }

  async componentDidMount(){
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token){ this.setState({ carregando: false, erro: true }); return; }
    try {
      const res = await fetch(this.apiBase + '/entregador/' + token);
      if (!res.ok){ this.setState({ carregando: false, erro: true }); return; }
      const data = await res.json();
      this.setState({ carregando: false, entregador: data.entregador, pedidos: data.pedidos });
    } catch (e){
      this.setState({ carregando: false, erro: true });
    }
  }

  renderVals(){
    const s = this.state;
    const cards = (s.pedidos || []).map(p => ({
      idLabel: '#' + String(p.id).padStart(4, '0'),
      nomeCliente: p.nomeCliente,
      enderecoFmt: this.enderecoFmt(p.endereco),
      itens: (p.itens || []).map(it => ({ label: it.quantidade + '× ' + (it.nome || '—') })),
      totalFmt: this.fmt(p.total),
      pgtoLabel: p.formaPagamento === 'PIX' ? 'Pix ✓' : 'Cartão ✓',
      mapsUrl: this.enderecoParaMaps(p.endereco),
    }));
    return {
      carregando: s.carregando,
      hasErro: !s.carregando && s.erro,
      hasData: !s.carregando && !s.erro,
      nomeEntregador: s.entregador ? s.entregador.nome : '',
      subtituloEntregas: cards.length === 0 ? 'Nenhuma entrega pendente' : cards.length + (cards.length === 1 ? ' entrega pendente' : ' entregas pendentes'),
      semEntregas: cards.length === 0,
      cards,
    };
  }
}
</script>
</body>
</html>
```

- [ ] **Step 2: Testar a tela do entregador**

1. Criar um entregador pelo admin e copiar o token (buscar no banco via Prisma Studio ou pela resposta do curl)
2. Acessar `http://localhost:5000/entregador.html?token=TOKEN_REAL`
3. Verificar que aparece "Olá, [nome]! Nenhuma entrega pendente"
4. Avançar um pedido para SAIU_ENTREGA e atribuir ao entregador pelo admin
5. Recarregar a tela do entregador — o card da entrega deve aparecer
6. Clicar "Abrir no Mapa" — deve abrir Google Maps com o endereço do cliente
7. Acessar `http://localhost:5000/entregador.html?token=token-invalido` — deve mostrar mensagem de erro

- [ ] **Step 3: Commit**

```bash
git add entregador.html
git commit -m "feat: tela publica do entregador com lista de entregas e botao GPS"
```

---

## Verificação Final

- [ ] Backend rodando sem erros no console
- [ ] Admin → Entregadores: criar, ver link, copiar, toggle ativo/inativo
- [ ] Admin → Pedidos: pedido em "Em rota" mostra select de entregadores ativos
- [ ] Selecionar entregador no select atualiza o estado e persiste no banco
- [ ] `entregador.html?token=TOKEN` mostra entregas do entregador
- [ ] `entregador.html?token=invalido` mostra mensagem de erro
- [ ] Botão "Abrir no Mapa" abre Google Maps com destino correto no celular
