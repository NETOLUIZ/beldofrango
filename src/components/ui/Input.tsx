/**
 * @file components/ui/Input.tsx
 * @description Componente input reutilizável.
 */

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  erro?: string;
}

/**
 * Componente Input: campo de entrada estilizado.
 */
export const Input: React.FC<InputProps> = ({
  label,
  erro,
  className = '',
  ...props
}) => {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="font-semibold text-sm text-gray-700">
          {label}
        </label>
      )}
      <input
        className={`border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 ${
          erro ? 'border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {erro && <span className="text-red-500 text-xs">{erro}</span>}
    </div>
  );
};
