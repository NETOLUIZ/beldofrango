/**
 * @file utils/validators.ts
 * @description Funções de validação reutilizáveis.
 */

/**
 * Valida um endereço de email.
 */
export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valida um número de telefone brasileira (com ou sem formatação).
 */
export function validarTelefone(telefone: string): boolean {
  const apenasNumeros = telefone.replace(/\D/g, '');
  return apenasNumeros.length === 11 || apenasNumeros.length === 10;
}

/**
 * Valida um CEP brasileiro.
 */
export function validarCEP(cep: string): boolean {
  const apenasNumeros = cep.replace(/\D/g, '');
  return apenasNumeros.length === 8;
}

/**
 * Valida uma senha (mínimo 8 caracteres, letra e número).
 */
export function validarSenha(senha: string): boolean {
  if (senha.length < 8) return false;
  const temLetra = /[a-zA-Z]/.test(senha);
  const temNumero = /\d/.test(senha);
  return temLetra && temNumero;
}

/**
 * Valida um valor monetário (preço).
 */
export function validarPreco(preco: number): boolean {
  return preco > 0 && Number.isFinite(preco);
}

/**
 * Valida quantidade de itens.
 */
export function validarQuantidade(quantidade: number): boolean {
  return Number.isInteger(quantidade) && quantidade > 0;
}
