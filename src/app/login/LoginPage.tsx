/**
 * @file app/login/LoginPage.tsx
 * @description Página de login do sistema.
 */

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { validarEmail } from '../../utils/validators';

/**
 * Página de login: autenticação de usuários.
 */
export const LoginPage: React.FC = () => {
  const { login, carregando } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState<{ email?: string; senha?: string }>({});

  const validar = () => {
    const novosErros: { email?: string; senha?: string } = {};

    if (!email) {
      novosErros.email = 'Email é obrigatório';
    } else if (!validarEmail(email)) {
      novosErros.email = 'Email inválido';
    }

    if (!senha) {
      novosErros.senha = 'Senha é obrigatória';
    } else if (senha.length < 6) {
      novosErros.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validar()) return;

    const sucesso = await login(email, senha);

    if (!sucesso) {
      setErros({ email: 'Email ou senha inválidos' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        {/* Logo/Título */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Bel do Frango</h1>
          <p className="text-gray-600">Faça login para continuar</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            erro={erros.email}
          />

          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            erro={erros.senha}
          />

          <Button
            type="submit"
            variant="primary"
            tamanho="grande"
            carregando={carregando}
            className="w-full"
          >
            Entrar
          </Button>
        </form>

        {/* Links adicionais */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Esqueceu a senha?{' '}
            <a href="#" className="text-orange-600 hover:text-orange-700 font-semibold">
              Recuperar acesso
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
