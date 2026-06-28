/**
 * @file services/api.ts
 * @description Cliente HTTP para comunicação com a API do backend.
 */

import { ApiResponse } from '../types';

/**
 * Classe que gerencia todas as requisições HTTP da aplicação.
 */
class ApiClient {
  private baseURL: string = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
  private token: string | null = null;

  /**
   * Define o token de autenticação para futuras requisições.
   */
  setToken(token: string) {
    this.token = token;
  }

  /**
   * Remove o token de autenticação.
   */
  clearToken() {
    this.token = null;
  }

  /**
   * Retorna os headers padrão para as requisições.
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Executa uma requisição GET.
   */
  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('Erro em GET:', error);
      throw error;
    }
  }

  /**
   * Executa uma requisição POST.
   */
  async post<T = any>(endpoint: string, dados: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(dados),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('Erro em POST:', error);
      throw error;
    }
  }

  /**
   * Executa uma requisição PUT.
   */
  async put<T = any>(endpoint: string, dados: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(dados),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('Erro em PUT:', error);
      throw error;
    }
  }

  /**
   * Executa uma requisição DELETE.
   */
  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('Erro em DELETE:', error);
      throw error;
    }
  }

  /**
   * Trata a resposta da API.
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const dados = await response.json();

    if (!response.ok) {
      console.error('Erro na resposta:', dados);
      return {
        sucesso: false,
        mensagem: dados.mensagem || 'Erro ao processar requisição',
        erro: dados.erro,
      };
    }

    return {
      sucesso: true,
      mensagem: dados.mensagem || 'Sucesso',
      dados: dados.dados,
    };
  }
}

// Instância única do cliente API (singleton)
export const apiClient = new ApiClient();
