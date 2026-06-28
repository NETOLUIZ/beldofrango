/**
 * @file app/cliente/ClientePage.tsx
 * @description Página do aplicativo do cliente (Delivery).
 */

import React, { useState, useEffect } from 'react';
import { Produto } from '../../types';
import { ProdutoCard } from '../../components/cards/ProdutoCard';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { navigateTo } from '../../router/routes';

/**
 * Página do cliente: catálogo de produtos e delivery.
 * Ponto de entrada da aplicação.
 */
export const ClientePage: React.FC = () => {
  const { usuario, logout } = useAuth();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [itensCarrinho, setItensCarrinho] = useState(0);

  // Simula carregamento de produtos
  useEffect(() => {
    setTimeout(() => {
      setProdutos([
        {
          id: '1',
          nome: 'Meia Frango com Batata',
          descricao: 'Meia frango assado com batata frita crocante',
          preco: 24.90,
          categoria: 'principais',
          disponivel: true,
          estoque: 50,
        },
        {
          id: '2',
          nome: 'Frango Inteiro',
          descricao: 'Frango inteiro assado, perfeito para compartilhar',
          preco: 45.90,
          categoria: 'principais',
          disponivel: true,
          estoque: 30,
        },
        {
          id: '3',
          nome: 'Refrigerante 2L',
          descricao: 'Escolha seu sabor favorito',
          preco: 8.90,
          categoria: 'bebidas',
          disponivel: true,
          estoque: 100,
        },
      ]);
      setCarregando(false);
    }, 1000);
  }, []);

  const handleAdicionarAoCarrinho = (produtoId: string) => {
    setItensCarrinho((prev) => prev + 1);
    alert(`Produto adicionado ao carrinho!`);
  };

  const handleIrCardapio = () => {
    navigateTo('/cardapio');
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-2xl">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header usuario={usuario} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-lg shadow-lg p-12 mb-8 text-white">
          <h2 className="text-4xl font-bold mb-2">Bem-vindo à Bel do Frango!</h2>
          <p className="text-lg mb-6">Escolha os melhores sabores diretamente na sua casa</p>
          <Button variant="primary" tamanho="grande" onClick={handleIrCardapio} className="bg-white text-orange-600 hover:bg-gray-100">
            🍗 Ver Cardápio Completo
          </Button>
        </div>

        {/* Destaques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl mb-2">⏱️</div>
            <h3 className="text-xl font-bold mb-2">30-40 Minutos</h3>
            <p className="text-gray-600">Entrega rápida e segura</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl mb-2">🛵</div>
            <h3 className="text-xl font-bold mb-2">Rastreamento</h3>
            <p className="text-gray-600">Acompanhe seu pedido em tempo real</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl mb-2">💳</div>
            <h3 className="text-xl font-bold mb-2">Formas de Pagamento</h3>
            <p className="text-gray-600">Cartão, PIX e dinheiro</p>
          </div>
        </div>

        {/* Produtos em Destaque */}
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Produtos em Destaque</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {produtos.slice(0, 3).map((produto) => (
            <ProdutoCard
              key={produto.id}
              produto={produto}
              onAdicionar={handleAdicionarAoCarrinho}
            />
          ))}
        </div>

        {/* CTA Principal */}
        <div className="text-center bg-white rounded-lg shadow p-8">
          <h3 className="text-2xl font-bold mb-4">Veja Todo o Nosso Cardápio</h3>
          <p className="text-gray-600 mb-6">Temos muito mais sabores para você escolher!</p>
          <Button 
            variant="primary" 
            tamanho="grande" 
            onClick={handleIrCardapio}
          >
            Ver Cardápio Completo →
          </Button>
        </div>

        {/* Indicador do Carrinho */}
        {itensCarrinho > 0 && (
          <div className="fixed bottom-8 right-8 bg-orange-600 text-white rounded-full p-6 shadow-lg cursor-pointer" 
               onClick={() => navigateTo('/checkout')}>
            <div className="text-center">
              <div className="text-3xl font-bold">{itensCarrinho}</div>
              <div className="text-sm">itens</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
