/**
 * @file components/cards/ProdutoCard.tsx
 * @description Card para exibir informações de um produto.
 */

import React from 'react';
import { Produto } from '../../types';
import { formatarMoeda } from '../../utils/formatters';
import { Button } from '../ui/Button';

interface ProdutoCardProps {
  produto: Produto;
  onAdicionar?: (produtoId: string) => void;
}

/**
 * Componente ProdutoCard: exibe informações de um produto.
 */
export const ProdutoCard: React.FC<ProdutoCardProps> = ({
  produto,
  onAdicionar,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Imagem do produto */}
      {produto.imagem && (
        <img
          src={produto.imagem}
          alt={produto.nome}
          className="w-full h-48 object-cover"
        />
      )}

      {/* Conteúdo */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{produto.nome}</h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {produto.descricao}
        </p>

        {/* Preço */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-2xl font-bold text-orange-600">
            {formatarMoeda(produto.preco)}
          </span>
          {produto.disponivel ? (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              Disponível
            </span>
          ) : (
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
              Indisponível
            </span>
          )}
        </div>

        {/* Botão */}
        {onAdicionar && (
          <Button
            variant="primary"
            tamanho="pequeno"
            onClick={() => onAdicionar(produto.id)}
            disabled={!produto.disponivel}
            className="w-full"
          >
            Adicionar ao Carrinho
          </Button>
        )}
      </div>
    </div>
  );
};
