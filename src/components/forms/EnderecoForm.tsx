/**
 * @file components/forms/EnderecoForm.tsx
 * @description Formulário para cadastro de endereço.
 */

import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface EnderecoFormProps {
  onSubmit: (endereco: any) => void;
}

/**
 * Componente EnderecoForm: formulário de endereço para delivery.
 */
export const EnderecoForm: React.FC<EnderecoFormProps> = ({ onSubmit }) => {
  const [endereco, setEndereco] = useState({
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    cep: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEndereco((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(endereco);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <h3 className="text-lg font-bold mb-4">Endereço de Entrega</h3>

      <Input
        label="Rua"
        name="rua"
        placeholder="Rua..."
        value={endereco.rua}
        onChange={handleChange}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Número"
          name="numero"
          placeholder="123"
          value={endereco.numero}
          onChange={handleChange}
        />
        <Input
          label="CEP"
          name="cep"
          placeholder="01310-100"
          value={endereco.cep}
          onChange={handleChange}
        />
      </div>

      <Input
        label="Complemento"
        name="complemento"
        placeholder="Apt 101 (opcional)"
        value={endereco.complemento}
        onChange={handleChange}
      />

      <Input
        label="Bairro"
        name="bairro"
        placeholder="Centro"
        value={endereco.bairro}
        onChange={handleChange}
      />

      <Input
        label="Cidade"
        name="cidade"
        placeholder="São Paulo"
        value={endereco.cidade}
        onChange={handleChange}
      />

      <Button type="submit" variant="primary" tamanho="medio" className="w-full">
        Confirmar Endereço
      </Button>
    </form>
  );
};
