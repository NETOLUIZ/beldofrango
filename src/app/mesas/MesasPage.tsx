/**
 * @file app/mesas/MesasPage.tsx
 * @description Página de gerenciamento de mesas.
 */

import React, { useState, useEffect } from 'react';
import { Mesa } from '../../types';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';

/**
 * Página de mesas: gerenciamento de mesas do salão.
 */
export const MesasPage: React.FC = () => {
  const { usuario, logout } = useAuth();
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Simula carregamento de mesas
  useEffect(() => {
    setTimeout(() => {
      setMesas([
        { id: '1', numero: 1, capacidade: 4, status: 'livre' },
        { id: '2', numero: 2, capacidade: 4, status: 'ocupada' },
        { id: '3', numero: 3, capacidade: 6, status: 'livre' },
        { id: '4', numero: 4, capacidade: 2, status: 'ocupada' },
        { id: '5', numero: 5, capacidade: 8, status: 'livre' },
        { id: '6', numero: 6, capacidade: 4, status: 'livre' },
      ]);
      setCarregando(false);
    }, 800);
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      livre: 'bg-green-100 text-green-800',
      ocupada: 'bg-red-100 text-red-800',
      reservada: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-2xl">Carregando mesas...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header usuario={usuario} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Gerenciar Mesas</h2>

        {/* Grid de mesas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mesas.map((mesa) => (
            <div
              key={mesa.id}
              className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl font-bold text-orange-600 mb-2">
                Mesa {mesa.numero}
              </div>

              <div className="text-sm text-gray-600 mb-3">
                Capacidade: {mesa.capacidade} pessoas
              </div>

              <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 ${getStatusColor(mesa.status)}`}>
                {mesa.status.toUpperCase()}
              </div>

              {mesa.status === 'livre' && (
                <Button
                  variant="primary"
                  tamanho="pequeno"
                  className="w-full"
                >
                  Abrir Comanda
                </Button>
              )}

              {mesa.status === 'ocupada' && (
                <Button
                  variant="secondary"
                  tamanho="pequeno"
                  className="w-full"
                >
                  Ver Comanda
                </Button>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
