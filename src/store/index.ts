/**
 * @file store/index.ts
 * @description Estado global da aplicação (gerenciamento de estado).
 * Pode ser ampliado com Redux, Zustand, Recoil, etc.
 */

import { Comanda, Pedido, User } from '../types';

/**
 * Estado global da aplicação.
 */
export interface AppState {
  // Autenticação
  usuario: User | null;
  autenticado: boolean;

  // Carrinho/Comanda
  comandaAtiva: Comanda | null;

  // Pedidos
  pedidos: Pedido[];

  // UI
  carregando: boolean;
  erro: string | null;
}

/**
 * Estado inicial da aplicação.
 */
export const initialState: AppState = {
  usuario: null,
  autenticado: false,
  comandaAtiva: null,
  pedidos: [],
  carregando: false,
  erro: null,
};

/**
 * Tipos de ações do store.
 */
export type StoreAction =
  | { type: 'SET_USUARIO'; payload: User }
  | { type: 'CLEAR_USUARIO' }
  | { type: 'SET_AUTENTICADO'; payload: boolean }
  | { type: 'SET_COMANDA_ATIVA'; payload: Comanda }
  | { type: 'CLEAR_COMANDA_ATIVA' }
  | { type: 'SET_PEDIDOS'; payload: Pedido[] }
  | { type: 'ADD_PEDIDO'; payload: Pedido }
  | { type: 'SET_CARREGANDO'; payload: boolean }
  | { type: 'SET_ERRO'; payload: string | null };

/**
 * Redutor para atualizar o estado global.
 */
export function storeReducer(state: AppState, action: StoreAction): AppState {
  switch (action.type) {
    case 'SET_USUARIO':
      return { ...state, usuario: action.payload, autenticado: true };

    case 'CLEAR_USUARIO':
      return { ...state, usuario: null, autenticado: false };

    case 'SET_AUTENTICADO':
      return { ...state, autenticado: action.payload };

    case 'SET_COMANDA_ATIVA':
      return { ...state, comandaAtiva: action.payload };

    case 'CLEAR_COMANDA_ATIVA':
      return { ...state, comandaAtiva: null };

    case 'SET_PEDIDOS':
      return { ...state, pedidos: action.payload };

    case 'ADD_PEDIDO':
      return { ...state, pedidos: [...state.pedidos, action.payload] };

    case 'SET_CARREGANDO':
      return { ...state, carregando: action.payload };

    case 'SET_ERRO':
      return { ...state, erro: action.payload };

    default:
      return state;
  }
}
