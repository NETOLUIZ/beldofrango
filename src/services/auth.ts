/**
 * @file services/auth.ts
 * @description Serviço de autenticação e gerenciamento de sessão.
 */

import { apiClient } from './api';
import { User, AuthSession } from '../types';

/**
 * Serviço de autenticação.
 */
class AuthService {
  private sessionKey = 'bdf_session'; // Chave para localStorage
  private tokenKey = 'bdf_token';

  /**
   * Faz login do usuário.
   */
  async login(email: string, senha: string): Promise<AuthSession | null> {
    try {
      const response = await apiClient.post('/auth/login', { email, senha });

      if (response.sucesso && response.dados) {
        const session: AuthSession = response.dados;
        this.salvarSessao(session);
        apiClient.setToken(session.token);
        return session;
      }

      return null;
    } catch (erro) {
      console.error('Erro ao fazer login:', erro);
      return null;
    }
  }

  /**
   * Faz logout do usuário.
   */
  logout() {
    this.limparSessao();
    apiClient.clearToken();
  }

  /**
   * Obtém a sessão salva no localStorage.
   */
  obterSessao(): AuthSession | null {
    const sessionJson = localStorage.getItem(this.sessionKey);
    if (!sessionJson) return null;

    try {
      return JSON.parse(sessionJson);
    } catch {
      return null;
    }
  }

  /**
   * Obtém o token salvo.
   */
  obterToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Verifica se há uma sessão ativa e válida.
   */
  estaAutenticado(): boolean {
    const session = this.obterSessao();
    if (!session) return false;

    const agora = new Date();
    const expiracao = new Date(session.expiradoEm);

    return agora < expiracao;
  }

  /**
   * Obtém o usuário autenticado atual.
   */
  obterUsuarioAtual(): User | null {
    const session = this.obterSessao();
    return session?.usuario || null;
  }

  /**
   * Refresha o token de autenticação.
   */
  async atualizarToken(): Promise<boolean> {
    try {
      const token = this.obterToken();
      if (!token) return false;

      const response = await apiClient.post('/auth/refresh', { token });

      if (response.sucesso && response.dados) {
        const novaSession: AuthSession = response.dados;
        this.salvarSessao(novaSession);
        apiClient.setToken(novaSession.token);
        return true;
      }

      return false;
    } catch (erro) {
      console.error('Erro ao atualizar token:', erro);
      return false;
    }
  }

  /**
   * Muda a senha do usuário.
   */
  async mudarSenha(senhaAntiga: string, senhaNova: string): Promise<boolean> {
    try {
      const response = await apiClient.post('/auth/mudar-senha', {
        senhaAntiga,
        senhaNova,
      });

      return response.sucesso;
    } catch (erro) {
      console.error('Erro ao mudar senha:', erro);
      return false;
    }
  }

  /**
   * Salva a sessão no localStorage.
   */
  private salvarSessao(session: AuthSession) {
    localStorage.setItem(this.sessionKey, JSON.stringify(session));
    localStorage.setItem(this.tokenKey, session.token);
  }

  /**
   * Limpa a sessão do localStorage.
   */
  private limparSessao() {
    localStorage.removeItem(this.sessionKey);
    localStorage.removeItem(this.tokenKey);
  }
}

// Instância única do serviço de autenticação
export const authService = new AuthService();
