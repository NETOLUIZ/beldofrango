/**
 * @file app/admin/AdminPage.tsx
 * @description Página do painel de administração.
 */

import React, { useState, useEffect } from 'react';
import { Pedido } from '../../types';
import { Header } from '../../components/layout/Header';
import { useAuth } from '../../hooks/useAuth';
import { formatarMoeda, formatarDataHora } from '../../utils/formatters';

/**
 * Página do painel admin: gerenciamento de pedidos e vendas.
 */
export const AdminPage: React.FC = () => {
  const { usuario, logout } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Simula carregamento de pedidos
  useEffect(() => {
    setTimeout(() => {
      setPedidos([
        {
          id: '1',
          clienteId: 'cli1',
          status: 'preparando',
          itens: [],
          endereco: {
            rua: 'Rua A',
            numero: '123',
            bairro: 'Centro',
            cidade: 'São Paulo',
            cep: '01310100',
          },
          subtotal: 50,
          taxa_entrega: 5,
          total: 55,
          criado_em: new Date(),
          atualizado_em: new Date(),
        },
      ]);
      setCarregando(false);
    }, 1000);
  }, []);

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-2xl">Carregando painel...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header usuario={usuario} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Painel de Administração</h2>

        {/* Tabela de pedidos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">ID</th>
                <th className="px-6 py-3 text-left font-semibold">Status</th>
                <th className="px-6 py-3 text-left font-semibold">Total</th>
                <th className="px-6 py-3 text-left font-semibold">Data</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((pedido) => (
                <tr key={pedido.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3">{pedido.id}</td>
                  <td className="px-6 py-3">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-semibold">
                      {pedido.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-bold">{formatarMoeda(pedido.total)}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {formatarDataHora(pedido.criado_em)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};
