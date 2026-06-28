/**
 * @file types/index.ts
 * @description Tipos e interfaces globais do aplicativo Bel do Frango.
 */

/**
 * Tipos de usuário/perfil do sistema.
 */
export type UserRole = 'admin' | 'gerente' | 'garcom' | 'caixa' | 'cliente' | 'entregador';

/**
 * Interface do usuário autenticado.
 */
export interface User {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  telefone?: string;
  avatar?: string;
  ativo: boolean;
  criadoEm: Date;
}

/**
 * Interface de autenticação/sessão.
 */
export interface AuthSession {
  token: string;
  usuario: User;
  expiradoEm: Date;
}

/**
 * Interface de um produto/item do cardápio.
 */
export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  imagem?: string;
  disponivel: boolean;
  estoque: number;
  tags?: string[];
}

/**
 * Interface de item do carrinho/comanda.
 */
export interface ItemComanda {
  produtoId: string;
  produto: Produto;
  quantidade: number;
  observacoes?: string;
  preco: number; // preço total do item (quantidade × preço do produto)
}

/**
 * Interface de pedido/comanda.
 */
export interface Comanda {
  id: string;
  mesaId?: string;
  clienteId?: string;
  status: 'aberta' | 'em_prep' | 'pronto' | 'entregue' | 'cancelada';
  itens: ItemComanda[];
  subtotal: number;
  taxa_servico: number;
  total: number;
  observacoes?: string;
  criada_em: Date;
  atualizada_em: Date;
}

/**
 * Interface de mesa.
 */
export interface Mesa {
  id: string;
  numero: number;
  capacidade: number;
  status: 'livre' | 'ocupada' | 'reservada';
  comandaAtiva?: string; // ID da comanda ativa
  qrCode?: string; // URL do QR code da mesa
}

/**
 * Interface de pedido de delivery.
 */
export interface Pedido {
  id: string;
  clienteId: string;
  status: 'pendente' | 'confirmado' | 'preparando' | 'saiu_entrega' | 'entregue' | 'cancelado';
  itens: ItemComanda[];
  endereco: {
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    cep: string;
  };
  subtotal: number;
  taxa_entrega: number;
  desconto?: number;
  total: number;
  observacoes?: string;
  entregadorId?: string;
  estimado_em?: Date;
  criado_em: Date;
  atualizado_em: Date;
}

/**
 * Interface de resposta da API.
 */
export interface ApiResponse<T = any> {
  sucesso: boolean;
  mensagem: string;
  dados?: T;
  erro?: string;
}

/**
 * Interface para paginação.
 */
export interface Paginacao {
  pagina: number;
  limit: number;
  total: number;
  totalPaginas: number;
}

/**
 * Interface de relatório de vendas.
 */
export interface RelatorioVendas {
  data: Date;
  totalVendas: number;
  totalItens: number;
  ticketMedio: number;
  produtos_mais_vendidos: Array<{
    produtoId: string;
    nome: string;
    quantidade: number;
    receita: number;
  }>;
}
