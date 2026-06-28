/**
 * @file components/ui/Button.tsx
 * @description Componente botão reutilizável.
 */

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  tamanho?: 'pequeno' | 'medio' | 'grande';
  carregando?: boolean;
}

/**
 * Componente Button: botão estilizado e reutilizável.
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  tamanho = 'medio',
  carregando = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'font-semibold rounded transition-all duration-200 flex items-center justify-center';

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400',
  };

  const tamanhoStyles = {
    pequeno: 'px-3 py-1 text-sm',
    medio: 'px-4 py-2 text-base',
    grande: 'px-6 py-3 text-lg',
  };

  const classes = `${baseStyles} ${variantStyles[variant]} ${tamanhoStyles[tamanho]} ${className}`;

  return (
    <button
      disabled={disabled || carregando}
      className={classes}
      {...props}
    >
      {carregando ? (
        <>
          <span className="animate-spin mr-2">⏳</span>
          Carregando...
        </>
      ) : (
        children
      )}
    </button>
  );
};
