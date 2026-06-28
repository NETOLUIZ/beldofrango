/**
 * @file components/forms/LoginForm.tsx
 * @description Formulário de login.
 */

import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface LoginFormProps {
  onSubmit: (email: string, senha: string) => Promise<void>;
  carregando?: boolean;
}

/**
 * Componente LoginForm: formulário de autenticação.
 */
export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  carregando = false,
}) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState<{ email?: string; senha?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const novosErros: { email?: string; senha?: string } = {};

    if (!email) novosErros.email = 'Email obrigatório';
    if (!senha) novosErros.senha = 'Senha obrigatória';

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    try {
      await onSubmit(email, senha);
    } catch (erro) {
      setErros({ email: 'Erro ao fazer login' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
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
  );
};
