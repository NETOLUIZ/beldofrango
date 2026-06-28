const { prisma } = require('../utils/db');

/** Lista os tamanhos de marmita (pequena/grande) com preço atual — usado pela aba Marmitas do Cardápio. */
async function listarPublico(req, res) {
  try {
    const tamanhos = await prisma.tamanhoMarmita.findMany({ orderBy: { qtdProteinas: 'asc' } });
    res.json(tamanhos);
  } catch (err) {
    console.error('Erro ao listar tamanhos de marmita:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
}

/** Atualiza preço/nome/quantidade de proteínas de um tamanho — painel admin. */
async function atualizar(req, res) {
  try {
    const id = req.params.id;
    const { nome, qtdProteinas, preco } = req.body;
    const data = {};
    if (nome !== undefined) data.nome = String(nome).trim();
    if (qtdProteinas !== undefined) data.qtdProteinas = parseInt(qtdProteinas, 10);
    if (preco !== undefined) data.preco = Number(preco);

    const tamanho = await prisma.tamanhoMarmita.update({ where: { id }, data });
    res.json(tamanho);
  } catch (err) {
    console.error('Erro ao atualizar tamanho de marmita:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
}

module.exports = { listarPublico, atualizar };
