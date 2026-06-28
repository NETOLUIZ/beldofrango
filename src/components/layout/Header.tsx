/**
 * @file components/layout/Header.tsx
 * @description Componente cabeçalho com navegação.
 */

import React from 'react';
import { User } from '../../types';

interface HeaderProps {
  usuario?: User | null;
  onLogout?: () => void;
}

/**
 * Componente Header: cabeçalho da aplicação.
 */
export const Header: React.FC<HeaderProps> = ({ usuario, onLogout }) => {
  return (
    <header className="bg-orange-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Bel do Frango</h1>
        </div>

        <nav className="flex items-center gap-8">
          {usuario && (
            <div className="flex items-center gap-4">
              <span className="text-sm">
                Olá, <strong>{usuario.nome}</strong>
              </span>
              <span className="bg-orange-500 px-2 py-1 rounded text-xs font-semibold">
                {usuario.role.toUpperCase()}
              </span>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm font-semibold transition-all"
                >
                  Sair
                </button>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
