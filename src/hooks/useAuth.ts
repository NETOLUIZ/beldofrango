/**
 * @file hooks/useAuth.ts
 * @description Hook customizado para gerenciar autenticação.
 */

import { useState, useEffect } from 'react';
import { authService } from '../services/auth';
import { User, AuthSession } from '../types';

/**
 * Hook para gerenciar autenticação.
 */
export function useAuth() {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [autenticado, setAutenticado] = useState(false);

  // Verifica se há sessão salva ao carregar o componente
  useEffect(() => {
    const session = authService.obterSessao();
    if (session && authService.estaAutenticado()) {
      setUsuario(session.usuario);
      setAutenticado(true);
    }
    setCarregando(false);
  }, []);

  const login = async (email: string, senha: string) => {
    setCarregando(true);
    const session = await authService.login(email, senha);

    if (session) {
      setUsuario(session.usuario);
      setAutenticado(true);
      return true;
    }

    setAutenticado(false);
    setCarregando(false);
    return false;
  };

  const logout = () => {
    authService.logout();
    setUsuario(null);
    setAutenticado(false);
  };

  return {
    usuario,
    autenticado,
    carregando,
    login,
    logout,
  };
}
