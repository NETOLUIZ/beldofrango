/**
 * @file utils/formatters.ts
 * @description Funções para formatação de dados.
 */

/**
 * Formata um valor monetário em reais.
 */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

/**
 * Formata uma data em formato brasileiro.
 */
export function formatarData(data: Date | string): string {
  const d = typeof data === 'string' ? new Date(data) : data;

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

/**
 * Formata uma data e hora em formato brasileiro.
 */
export function formatarDataHora(data: Date | string): string {
  const d = typeof data === 'string' ? new Date(data) : data;

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(d);
}

/**
 * Formata um telefone brasileiro.
 */
export function formatarTelefone(telefone: string): string {
  const apenasNumeros = telefone.replace(/\D/g, '');

  if (apenasNumeros.length === 11) {
    return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7)}`;
  } else if (apenasNumeros.length === 10) {
    return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 6)}-${apenasNumeros.slice(6)}`;
  }

  return telefone;
}

/**
 * Formata um CEP brasileiro.
 */
export function formatarCEP(cep: string): string {
  const apenasNumeros = cep.replace(/\D/g, '');

  if (apenasNumeros.length === 8) {
    return `${apenasNumeros.slice(0, 5)}-${apenasNumeros.slice(5)}`;
  }

  return cep;
}

/**
 * Trunca um texto com reticências.
 */
export function truncarTexto(texto: string, limite: number = 50): string {
  if (texto.length <= limite) return texto;
  return texto.slice(0, limite) + '...';
}
