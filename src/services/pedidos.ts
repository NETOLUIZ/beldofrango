/**
 * @file services/pedidos.ts
 * @description Serviço para gerenciar pedidos, comandas e deliveries.
 */

import { apiClient } from './api';
import { Comanda, Pedido, ApiResponse } from '../types';

/**
 * Serviço de gerenciamento de pedidos e comandas.
 */
class PedidosService {
  /**
   * Cria uma nova comanda.
   */
  async criarComanda(mesaId?: string, clienteId?: string): Promise<Comanda | null> {
    try {
      const response = await apiClient.post('/comandas', { mesaId, clienteId });

      if (response.sucesso && response.dados) {
        return response.dados;
      }

      return null;
    } catch (erro) {
      console.error('Erro ao criar comanda:', erro);
      return null;
    }
  }

  /**
   * Obtém uma comanda por ID.
   */
  async obterComanda(comandaId: string): Promise<Comanda | null> {
    try {
      const response = await apiClient.get(`/comandas/${comandaId}`);

      if (response.sucesso && response.dados) {
        return response.dados;
      }

      return null;
    } catch (erro) {
      console.error('Erro ao obter comanda:', erro);
      return null;
    }
  }

  /**
   * Adiciona um item à comanda.
   */
  async adicionarItem(
    comandaId: string,
    produtoId: string,
    quantidade: number,
    observacoes?: string
  ): Promise<Comanda | null> {
    try {
      const response = await apiClient.post(`/comandas/${comandaId}/itens`, {
        produtoId,
        quantidade,
        observacoes,
      });

      if (response.sucesso && response.dados) {
        return response.dados;
      }

      return null;
    } catch (erro) {
      console.error('Erro ao adicionar item:', erro);
      return null;
    }
  }

  /**
   * Remove um item da comanda.
   */
  async removerItem(comandaId: string, itemId: string): Promise<Comanda | null> {
    try {
      const response = await apiClient.delete(`/comandas/${comandaId}/itens/${itemId}`);

      if (response.sucesso && response.dados) {
        return response.dados;
      }

      return null;
    } catch (erro) {
      console.error('Erro ao remover item:', erro);
      return null;
    }
  }

  /**
   * Finaliza uma comanda.
   */
  async finalizarComanda(comandaId: string): Promise<Comanda | null> {
    try {
      const response = await apiClient.put(`/comandas/${comandaId}/finalizar`, {});

      if (response.sucesso && response.dados) {
        return response.dados;
      }

      return null;
    } catch (erro) {
      console.error('Erro ao finalizar comanda:', erro);
      return null;
    }
  }

  /**
   * Cria um novo pedido de delivery.
   */
  async criarPedido(dados: Partial<Pedido>): Promise<Pedido | null> {
    try {
      const response = await apiClient.post('/pedidos', dados);

      if (response.sucesso && response.dados) {
        return response.dados;
      }

      return null;
    } catch (erro) {
      console.error('Erro ao criar pedido:', erro);
      return null;
    }
  }

  /**
   * Obtém um pedido por ID.
   */
  async obterPedido(pedidoId: string): Promise<Pedido | null> {
    try {
      const response = await apiClient.get(`/pedidos/${pedidoId}`);

      if (response.sucesso && response.dados) {
        return response.dados;
      }

      return null;
    } catch (erro) {
      console.error('Erro ao obter pedido:', erro);
      return null;
    }
  }

  /**
   * Lista pedidos com filtros opcionais.
   */
  async listarPedidos(filtros?: {
    status?: string;
    clienteId?: string;
    pagina?: number;
    limit?: number;
  }): Promise<{ pedidos: Pedido[]; total: number } | null> {
    try {
      const params = new URLSearchParams();
      if (filtros?.status) params.append('status', filtros.status);
      if (filtros?.clienteId) params.append('clienteId', filtros.clienteId);
      if (filtros?.pagina) params.append('pagina', String(filtros.pagina));
      if (filtros?.limit) params.append('limit', String(filtros.limit));

      const endpoint = `/pedidos${params.toString() ? '?' + params.toString() : ''}`;
      const response = await apiClient.get(endpoint);

      if (response.sucesso && response.dados) {
        return response.dados;
      }

      return null;
    } catch (erro) {
      console.error('Erro ao listar pedidos:', erro);
      return null;
    }
  }

  /**
   * Atualiza o status de um pedido.
   */
  async atualizarStatusPedido(pedidoId: string, novoStatus: string): Promise<Pedido | null> {
    try {
      const response = await apiClient.put(`/pedidos/${pedidoId}`, {
        status: novoStatus,
      });

      if (response.sucesso && response.dados) {
        return response.dados;
      }

      return null;
    } catch (erro) {
      console.error('Erro ao atualizar pedido:', erro);
      return null;
    }
  }

  /**
   * Cancela um pedido.
   */
  async cancelarPedido(pedidoId: string, motivo?: string): Promise<Pedido | null> {
    try {
      const response = await apiClient.put(`/pedidos/${pedidoId}/cancelar`, { motivo });

      if (response.sucesso && response.dados) {
        return response.dados;
      }

      return null;
    } catch (erro) {
      console.error('Erro ao cancelar pedido:', erro);
      return null;
    }
  }
}

// Instância única do serviço de pedidos
export const pedidosService = new PedidosService();
