/**
 * Script de demonstracao do Bel do Frango ATU.
 * Cria entregadores e 20 pedidos com dados realistas para visualizacao do painel admin
 * e da tela publica do entregador.
 *
 * Uso:
 *   node prisma/demo.js          -- cria dados de demo (idempotente: pula se ja existirem pedidos)
 *   node prisma/demo.js --reset  -- apaga pedidos/entregadores/clientes de demo e recria do zero
 *
 * Pre-requisito: seed ja executado (cd backend && npm run db:seed).
 */

// Carrega variaveis de ambiente do .env no diretorio raiz do backend
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Constantes do demo
// ---------------------------------------------------------------------------

/** Taxa de entrega fixa aplicada em todos os pedidos de demo. */
const TAXA_ENTREGA = 7.9;

/** Codigo do cupom de desconto ja criado pelo seed. */
const CUPOM_DEMO = 'FRANGO10';

/** Percentual decimal do cupom FRANGO10 (0.10 = 10 %). */
const PERCENTUAL_DESCONTO = 0.1;

/**
 * Entregadores de demonstracao.
 * Token UUID gerado automaticamente pelo Prisma (@default(uuid())).
 * Identificados pelo nome para evitar duplicatas em rodadas sem --reset.
 */
const ENTREGADORES_DEMO = ['Joao Moto', 'Carlos Bike', 'Ana Rapidex'];

/**
 * Clientes de demonstracao.
 * Telefone e chave unica no banco -- upsert seguro.
 */
const CLIENTES_DEMO = [
  { nome: 'Dona Maria',       telefone: '47999991111' }, // indice 0
  { nome: 'Sr. Carlos',       telefone: '47988882222' }, // indice 1
  { nome: 'Juliana Ferreira', telefone: '47977773333' }, // indice 2
  { nome: 'Roberto Lima',     telefone: '47966664444' }, // indice 3
  { nome: 'Patricia Souza',   telefone: '47955555555' }, // indice 4
];

/**
 * Enderecos realistas de Blumenau/SC.
 * Campo complemento e null quando nao se aplica.
 */
const ENDERECOS = [
  { rua: 'Rua XV de Novembro',       numero: '342',  bairro: 'Centro',           complemento: null,      cidade: 'Blumenau', estado: 'SC' },
  { rua: 'Av. Brasil',               numero: '1520', bairro: 'Velha',            complemento: 'Ap. 302', cidade: 'Blumenau', estado: 'SC' },
  { rua: 'Rua Hermann Hering',       numero: '89',   bairro: 'Ponta Aguda',      complemento: null,      cidade: 'Blumenau', estado: 'SC' },
  { rua: 'Alameda Rio Branco',       numero: '221',  bairro: 'Itoupava Norte',   complemento: null,      cidade: 'Blumenau', estado: 'SC' },
  { rua: 'Rua Nereu Ramos',          numero: '456',  bairro: 'Garcia',           complemento: 'Sala 2',  cidade: 'Blumenau', estado: 'SC' },
  { rua: 'Rua Dom Pedro II',         numero: '780',  bairro: 'Vorstadt',         complemento: null,      cidade: 'Blumenau', estado: 'SC' },
  { rua: 'Av. Pastor Osvaldo Hesse', numero: '1100', bairro: 'Itoupava Central', complemento: null,      cidade: 'Blumenau', estado: 'SC' },
];

// ---------------------------------------------------------------------------
// Helpers financeiros
// ---------------------------------------------------------------------------

/**
 * Arredonda para 2 casas decimais, evitando imprecisao de ponto flutuante no log.
 * @param {number} n
 * @returns {number}
 */
function arred(n) {
  return Math.round(n * 100) / 100;
}

/**
 * Soma preco x quantidade de cada item para obter o subtotal bruto do pedido.
 * @param {{ preco: number, quantidade: number }[]} itens
 * @returns {number}
 */
function calcSubtotal(itens) {
  return arred(itens.reduce((acc, i) => acc + i.preco * i.quantidade, 0));
}

// ---------------------------------------------------------------------------
// Construtores de item (retornam objetos intermediarios, nao Prisma direto)
// ---------------------------------------------------------------------------

/**
 * Cria descritor de item de produto do cardapio (produtoId preenchido, tamanhoMarmitaId null).
 * @param {{ id: number, preco: number }} produto
 * @param {number} [quantidade=1]
 * @param {string|null} [observacoes=null]
 * @returns {Object}
 */
function itemProduto(produto, quantidade = 1, observacoes = null) {
  return { tipo: 'produto', produtoId: produto.id, preco: produto.preco, quantidade, observacoes };
}

/**
 * Cria descritor de item de marmita montada (tamanhoMarmitaId preenchido, produtoId null).
 * @param {{ id: string, preco: number }} tamanho
 * @param {number[]} proteinaIds
 * @param {number[]} complementoIds
 * @param {number} [quantidade=1]
 * @returns {Object}
 */
function itemMarmita(tamanho, proteinaIds, complementoIds, quantidade = 1) {
  return {
    tipo: 'marmita',
    tamanhoMarmitaId: tamanho.id,
    preco: tamanho.preco,
    quantidade,
    proteinaIds,
    complementoIds,
  };
}

// ---------------------------------------------------------------------------
// Definicao dos 20 pedidos de demo
// ---------------------------------------------------------------------------

/**
 * Monta o array com os 20 templates de pedido apos carregar os IDs do banco.
 * Distribuicao: CONFIRMADO(4), PREPARANDO(4), SAIU_ENTREGA(4), ENTREGUE(7), CANCELADO(1).
 *
 * @param {Object} p  - Mapa nome->{ id, preco } de produtos
 * @param {Object} t  - Mapa id->{ id, preco } de tamanhos de marmita
 * @param {Object} pr - Mapa nome->{ id } de proteinas
 * @param {Object} co - Mapa nome->{ id } de complementos
 * @returns {Array}
 */
function definirPedidos(p, t, pr, co) {
  /** Retorna Date N minutos atras a partir do momento de execucao. */
  const ha = (min) => new Date(Date.now() - min * 60 * 1000);

  // Atalhos para produtos frequentes
  const galeto       = p['Galeto Inteiro na Brasa'];
  const meioGaleto   = p['Meio Galeto na Brasa'];
  const coxaSobre    = p['Coxa e Sobrecoxa (4 un.)'];
  const passarinho   = p['Frango a Passarinho'];
  const polenta      = p['Porcao Polenta Frita'] || p['Porção Polenta Frita'];
  const farofa       = p['Farofa da Casa'];
  const comboFamilia = p['Combo Família'] || p['Combo Familia'];
  const comboCasal   = p['Combo Casal'];
  const guarana      = p['Guarana 2L'] || p['Guaraná 2L'];
  const mousse       = p['Mousse de Maracuja'] || p['Mousse de Maracujá'];

  const pequena = t['pequena'];
  const grande  = t['grande'];

  // IDs de proteinas
  const frangGrel  = pr['Frango Grelhado'].id;
  const carneMoida = pr['Carne Moida'] ? pr['Carne Moida'].id : pr['Carne Moída'].id;
  const frangParm  = pr['Frango a Parmegiana'] ? pr['Frango a Parmegiana'].id : pr['Frango à Parmegiana'].id;
  const linguica   = pr['Linguica Acebolada'] ? pr['Linguica Acebolada'].id : pr['Linguiça Acebolada'].id;

  // IDs de complementos
  const arroz     = co['Arroz'].id;
  const feijao    = co['Feijao Tropeiro'] ? co['Feijao Tropeiro'].id : co['Feijão Tropeiro'].id;
  const farofaC   = co['Farofa'].id;
  const vinagrete = co['Vinagrete'].id;
  const mandioca  = co['Mandioca Frita'].id;
  const salada    = co['Salada'].id;

  return [
    // ── CONFIRMADO (4) ──────────────────────────────────────────────────────
    {
      clienteIdx: 0, enderecoIdx: 0, formaPagamento: 'PIX',    comCupom: false,
      statusEntrega: 'CONFIRMADO', entregadorIdx: null, createdAt: ha(5),
      itens: [itemProduto(galeto, 1), itemProduto(guarana, 1)],
    },
    {
      clienteIdx: 1, enderecoIdx: 1, formaPagamento: 'CARTAO', comCupom: false,
      statusEntrega: 'CONFIRMADO', entregadorIdx: null, createdAt: ha(8),
      itens: [itemProduto(meioGaleto, 1), itemProduto(polenta, 1)],
    },
    {
      clienteIdx: 2, enderecoIdx: 2, formaPagamento: 'PIX', comCupom: true,
      statusEntrega: 'CONFIRMADO', entregadorIdx: null, createdAt: ha(3),
      itens: [
        itemMarmita(grande, [frangGrel, carneMoida], [arroz, feijao, farofaC]),
        itemProduto(mousse, 1),
      ],
    },
    {
      clienteIdx: 3, enderecoIdx: 3, formaPagamento: 'CARTAO', comCupom: false,
      statusEntrega: 'CONFIRMADO', entregadorIdx: null, createdAt: ha(2),
      itens: [itemProduto(comboFamilia, 1)],
    },

    // ── PREPARANDO (4) ──────────────────────────────────────────────────────
    {
      clienteIdx: 4, enderecoIdx: 4, formaPagamento: 'PIX', comCupom: false,
      statusEntrega: 'PREPARANDO', entregadorIdx: null, createdAt: ha(20),
      itens: [itemProduto(coxaSobre, 1), itemProduto(guarana, 2)],
    },
    {
      clienteIdx: 0, enderecoIdx: 0, formaPagamento: 'CARTAO', comCupom: true,
      statusEntrega: 'PREPARANDO', entregadorIdx: null, createdAt: ha(25),
      itens: [itemProduto(comboCasal, 1)],
    },
    {
      clienteIdx: 1, enderecoIdx: 5, formaPagamento: 'PIX', comCupom: false,
      statusEntrega: 'PREPARANDO', entregadorIdx: null, createdAt: ha(18),
      itens: [
        itemMarmita(pequena, [linguica], [arroz, salada]),
        itemProduto(passarinho, 1),
      ],
    },
    {
      clienteIdx: 2, enderecoIdx: 2, formaPagamento: 'CARTAO', comCupom: false,
      statusEntrega: 'PREPARANDO', entregadorIdx: null, createdAt: ha(22),
      itens: [itemProduto(galeto, 1), itemProduto(farofa, 1), itemProduto(mousse, 1)],
    },

    // ── SAIU_ENTREGA (4) ────────────────────────────────────────────────────
    {
      clienteIdx: 3, enderecoIdx: 6, formaPagamento: 'PIX', comCupom: false,
      statusEntrega: 'SAIU_ENTREGA', entregadorIdx: 0, createdAt: ha(45), // Joao Moto
      itens: [itemProduto(meioGaleto, 1), itemProduto(guarana, 1)],
    },
    {
      clienteIdx: 4, enderecoIdx: 4, formaPagamento: 'CARTAO', comCupom: true,
      statusEntrega: 'SAIU_ENTREGA', entregadorIdx: 1, createdAt: ha(50), // Carlos Bike
      itens: [
        itemMarmita(grande, [frangParm, carneMoida], [arroz, feijao, vinagrete]),
      ],
    },
    {
      clienteIdx: 0, enderecoIdx: 0, formaPagamento: 'PIX', comCupom: false,
      statusEntrega: 'SAIU_ENTREGA', entregadorIdx: 2, createdAt: ha(40), // Ana Rapidex
      itens: [itemProduto(comboFamilia, 1), itemProduto(guarana, 1)],
    },
    {
      clienteIdx: 1, enderecoIdx: 1, formaPagamento: 'CARTAO', comCupom: false,
      statusEntrega: 'SAIU_ENTREGA', entregadorIdx: 0, createdAt: ha(55), // Joao Moto
      itens: [itemProduto(coxaSobre, 1), itemProduto(polenta, 1)],
    },

    // ── ENTREGUE (7) ────────────────────────────────────────────────────────
    {
      clienteIdx: 2, enderecoIdx: 2, formaPagamento: 'PIX', comCupom: true,
      statusEntrega: 'ENTREGUE', entregadorIdx: 1, createdAt: ha(120), // Carlos Bike
      itens: [itemProduto(galeto, 1), itemProduto(guarana, 1)],
    },
    {
      clienteIdx: 3, enderecoIdx: 3, formaPagamento: 'CARTAO', comCupom: false,
      statusEntrega: 'ENTREGUE', entregadorIdx: 2, createdAt: ha(110), // Ana Rapidex
      itens: [
        itemMarmita(pequena, [frangGrel], [arroz, feijao]),
      ],
    },
    {
      clienteIdx: 4, enderecoIdx: 4, formaPagamento: 'PIX', comCupom: false,
      statusEntrega: 'ENTREGUE', entregadorIdx: 0, createdAt: ha(100), // Joao Moto
      itens: [itemProduto(comboCasal, 1)],
    },
    {
      clienteIdx: 0, enderecoIdx: 5, formaPagamento: 'CARTAO', comCupom: true,
      statusEntrega: 'ENTREGUE', entregadorIdx: 1, createdAt: ha(90), // Carlos Bike
      itens: [itemProduto(meioGaleto, 1), itemProduto(farofa, 1), itemProduto(mousse, 1)],
    },
    {
      clienteIdx: 1, enderecoIdx: 6, formaPagamento: 'PIX', comCupom: false,
      statusEntrega: 'ENTREGUE', entregadorIdx: 2, createdAt: ha(80), // Ana Rapidex
      itens: [itemProduto(coxaSobre, 1), itemProduto(guarana, 1)],
    },
    {
      clienteIdx: 2, enderecoIdx: 2, formaPagamento: 'CARTAO', comCupom: false,
      statusEntrega: 'ENTREGUE', entregadorIdx: 0, createdAt: ha(70), // Joao Moto
      itens: [
        itemMarmita(grande, [frangGrel, linguica], [arroz, farofaC, mandioca]),
      ],
    },
    {
      clienteIdx: 3, enderecoIdx: 3, formaPagamento: 'PIX', comCupom: true,
      statusEntrega: 'ENTREGUE', entregadorIdx: 1, createdAt: ha(150), // Carlos Bike
      itens: [itemProduto(comboFamilia, 1), itemProduto(mousse, 1)],
    },

    // ── CANCELADO (1) ───────────────────────────────────────────────────────
    {
      clienteIdx: 4, enderecoIdx: 4, formaPagamento: 'CARTAO', comCupom: false,
      statusEntrega: 'CANCELADO', entregadorIdx: null, createdAt: ha(130),
      itens: [itemProduto(galeto, 1)],
    },
  ];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const isReset = process.argv.includes('--reset');

  console.log('=== Demo Bel do Frango ATU ===\n');

  // 1. Verificar se o seed foi rodado (exige pelo menos 1 produto no banco)
  const qtdProdutos = await prisma.produto.count();
  if (qtdProdutos === 0) {
    console.error('Nenhum produto encontrado no banco.');
    console.error('Execute o seed antes: cd backend && npm run db:seed');
    process.exit(1);
  }

  // 2. Reset se solicitado: apaga pedidos (cascade nos itens), entregadores e clientes de demo
  if (isReset) {
    console.log('Flag --reset detectada -- limpando dados de demo...');

    // deleteMany em Pedido propaga Cascade para ItemPedido -> ItemPedidoProteina/Complemento
    const deletedPedidos = await prisma.pedido.deleteMany();
    console.log(`  ${deletedPedidos.count} pedido(s) deletado(s)`);

    const deletedEntregadores = await prisma.entregador.deleteMany({
      where: { nome: { in: ENTREGADORES_DEMO } },
    });
    console.log(`  ${deletedEntregadores.count} entregador(es) deletado(s)`);

    const deletedClientes = await prisma.cliente.deleteMany({
      where: { telefone: { in: CLIENTES_DEMO.map((c) => c.telefone) } },
    });
    console.log(`  ${deletedClientes.count} cliente(s) deletado(s)\n`);
  }

  // 3. Idempotencia sem --reset: pula se ja existirem pedidos no banco
  if (!isReset) {
    const qtdPedidos = await prisma.pedido.count();
    if (qtdPedidos > 0) {
      console.log(`Banco ja contem ${qtdPedidos} pedido(s) -- demo nao recriado.`);
      console.log('Para recriar do zero: node prisma/demo.js --reset\n');
      process.exit(0);
    }
  }

  // 4. Carregar lookup do catalogo (produtos, marmitas, proteinas, complementos, cupom)
  console.log('Carregando catalogo do banco...');

  const produtosList = await prisma.produto.findMany({ select: { id: true, nome: true, preco: true } });
  /** @type {Record<string, {id: number, preco: number}>} */
  const produtos = Object.fromEntries(produtosList.map((p) => [p.nome, { id: p.id, preco: p.preco }]));

  const tamanhosList = await prisma.tamanhoMarmita.findMany();
  /** @type {Record<string, {id: string, preco: number}>} */
  const tamanhos = Object.fromEntries(tamanhosList.map((t) => [t.id, { id: t.id, preco: t.preco }]));

  const proteinasList = await prisma.proteina.findMany({ select: { id: true, nome: true } });
  /** @type {Record<string, {id: number}>} */
  const proteinasMap = Object.fromEntries(proteinasList.map((pr) => [pr.nome, { id: pr.id }]));

  const complementosList = await prisma.complemento.findMany({ select: { id: true, nome: true } });
  /** @type {Record<string, {id: number}>} */
  const complementosMap = Object.fromEntries(complementosList.map((c) => [c.nome, { id: c.id }]));

  const cupomFrango = await prisma.cupom.findUnique({ where: { codigo: CUPOM_DEMO } });
  if (!cupomFrango) {
    console.error(`Cupom "${CUPOM_DEMO}" nao encontrado. Rode o seed novamente: npm run db:seed`);
    process.exit(1);
  }

  // 5. Upsert clientes de demo (chave: telefone)
  const clientesIds = [];
  for (const cliente of CLIENTES_DEMO) {
    const reg = await prisma.cliente.upsert({
      where: { telefone: cliente.telefone },
      update: { nome: cliente.nome },
      create: cliente,
    });
    clientesIds.push(reg.id);
  }
  console.log(`${CLIENTES_DEMO.length} clientes upserted`);

  // 6. Upsert entregadores de demo (sem unique por nome -> findFirst + create se ausente)
  const entregadoresIds = [];
  for (const nome of ENTREGADORES_DEMO) {
    let reg = await prisma.entregador.findFirst({ where: { nome } });
    if (!reg) {
      reg = await prisma.entregador.create({ data: { nome } });
    }
    entregadoresIds.push(reg.id);
  }
  console.log(`${ENTREGADORES_DEMO.length} entregadores criados/ja existentes`);

  // 7. Criar os 20 pedidos com itens aninhados
  console.log('Criando pedidos de demo...\n');

  const templates = definirPedidos(produtos, tamanhos, proteinasMap, complementosMap);

  /** Contador por status para o relatorio final. */
  const contadorStatus = { CONFIRMADO: 0, PREPARANDO: 0, SAIU_ENTREGA: 0, ENTREGUE: 0, CANCELADO: 0 };
  let totalFaturado = 0;
  let totalCriados = 0;

  for (const tpl of templates) {
    const dadosCliente = CLIENTES_DEMO[tpl.clienteIdx];
    const clienteId    = clientesIds[tpl.clienteIdx];
    const endereco     = ENDERECOS[tpl.enderecoIdx];
    const entregadorId = tpl.entregadorIdx !== null ? entregadoresIds[tpl.entregadorIdx] : null;

    // Calcular financeiro -- mesma logica do controller de producao
    const subtotal = calcSubtotal(tpl.itens.map((i) => ({ preco: i.preco, quantidade: i.quantidade })));
    const desconto  = tpl.comCupom ? arred(subtotal * PERCENTUAL_DESCONTO) : 0;
    const total     = arred(subtotal - desconto + TAXA_ENTREGA);

    // Converter descritores de item para o formato de nested create do Prisma
    const itensPrisma = tpl.itens.map((item) => {
      if (item.tipo === 'produto') {
        return {
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          precoUnitarioCongelado: item.preco,
          observacoes: item.observacoes ?? null,
        };
      }
      // marmita montada: inclui proteinas e complementos via nested create
      return {
        tamanhoMarmitaId: item.tamanhoMarmitaId,
        quantidade: item.quantidade,
        precoUnitarioCongelado: item.preco,
        proteinas: {
          create: item.proteinaIds.map((proteinaId) => ({ proteinaId })),
        },
        complementos: {
          create: item.complementoIds.map((complementoId) => ({ complementoId })),
        },
      };
    });

    await prisma.pedido.create({
      data: {
        clienteId,
        nomeCliente:    dadosCliente.nome,
        telefone:       dadosCliente.telefone,
        endereco,
        subtotal,
        desconto,
        taxaEntrega:    TAXA_ENTREGA,
        total,
        formaPagamento: tpl.formaPagamento,
        statusEntrega:  tpl.statusEntrega,
        cupomId:        tpl.comCupom ? cupomFrango.id : null,
        entregadorId,
        createdAt:      tpl.createdAt,
        itens: { create: itensPrisma },
      },
    });

    contadorStatus[tpl.statusEntrega]++;
    // Pedidos cancelados nao entram no faturamento simulado
    if (tpl.statusEntrega !== 'CANCELADO') totalFaturado += total;
    totalCriados++;
  }

  // 8. Relatorio final
  const totalFmt = totalFaturado.toFixed(2).replace('.', ',');

  console.log('-----------------------------------------');
  console.log(' Demo criado com sucesso!');
  console.log('-----------------------------------------');
  console.log(`Total de pedidos criados : ${totalCriados}`);
  console.log('Por status:');
  for (const [status, count] of Object.entries(contadorStatus)) {
    console.log(`  ${status.padEnd(16)} ${count} pedido(s)`);
  }
  console.log(`Faturamento simulado     : R$ ${totalFmt}  (excl. cancelado)`);
  console.log('-----------------------------------------');
  console.log('Entregadores:');
  ENTREGADORES_DEMO.forEach((nome, i) => {
    console.log(`  #${String(entregadoresIds[i]).padEnd(4)} ${nome}`);
  });
  console.log('-----------------------------------------');
}

main()
  .catch((e) => {
    console.error('Erro no demo:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
