/**
 * @file src/app/cardapio/CardapioPage.tsx
 * @description Página de cardápio digital para QR das mesas.
 */

import React, { useState, useEffect } from 'react';
import { Produto } from '../../types';
import { ProdutoCard } from '../../components/cards/ProdutoCard';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from '../../hooks/useRouter';

/**
 * Página de cardápio digital: acesso via QR code das mesas ou app cliente.
 */
export const CardapioPage: React.FC = () => {
  const { usuario, logout } = useAuth();
  const { navegar } = useRouter();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [categoria, setCategoria] = useState('todos');
  const [itensCarrinho, setItensCarrinho] = useState(0);

  useEffect(() => {
    // Simula carregamento de produtos
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
        {
          id: '4',
          nome: 'Sorvete Brigadeiro',
          descricao: 'Sobremesa gelada deliciosa',
          preco: 12.90,
          categoria: 'sobremesas',
          disponivel: true,
          estoque: 40,
        },
      ]);
      setCarregando(false);
    }, 800);
  }, []);

  const handleAdicionarAoCarrinho = (produtoId: string) => {
    setItensCarrinho((prev) => prev + 1);
    alert(`Produto adicionado ao carrinho!`);
  };

  if (carregando) {
    return <div className="p-4">Carregando cardápio...</div>;
  }

  const produtosFiltrados = produtos.filter(
    (p) => categoria === 'todos' || p.categoria === categoria
  );


  return (
    <div className="min-h-screen bg-gray-50">
      <Header usuario={usuario} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Cardápio</h2>
          <Button 
            variant="secondary" 
            tamanho="pequeno"
            onClick={() => navegar('/')}
          >
            ← Voltar
          </Button>
        </div>

        {/* Filtro de categorias */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['todos', 'principais', 'bebidas', 'sobremesas'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoria(cat)}
              className={`px-4 py-2 rounded font-semibold whitespace-nowrap transition-all ${
                categoria === cat
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Grid de produtos */}
        {produtosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {produtosFiltrados.map((produto) => (
              <ProdutoCard
                key={produto.id}
                produto={produto}
                onAdicionar={handleAdicionarAoCarrinho}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Nenhum produto encontrado nesta categoria</p>
          </div>
        )}

        {/* Indicador do Carrinho */}
        {itensCarrinho > 0 && (
          <div 
            className="fixed bottom-8 right-8 bg-orange-600 text-white rounded-full p-6 shadow-lg cursor-pointer hover:bg-orange-700 transition-all" 
            onClick={() => navegar('/checkout')}
          >
            <div className="text-center">
              <div className="text-3xl font-bold">{itensCarrinho}</div>
              <div className="text-sm">Ir para checkout</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
