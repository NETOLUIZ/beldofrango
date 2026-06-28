/**
 * @file src/router/routes.ts
 * @description Definição de rotas da aplicação.
 */

export type RouteType = '/' | '/cardapio' | '/checkout' | '/login' | '/admin' | '/mesas';

/**
 * Configuração de rotas da aplicação.
 */
export const routes: Record<RouteType, { path: RouteType; label: string; component: string }> = {
  '/': {
    path: '/',
    label: 'Home - Cliente',
    component: 'ClientePage',
  },
  '/cardapio': {
    path: '/cardapio',
    label: 'Cardápio',
    component: 'CardapioPage',
  },
  '/checkout': {
    path: '/checkout',
    label: 'Checkout',
    component: 'CheckoutPage',
  },
  '/login': {
    path: '/login',
    label: 'Login',
    component: 'LoginPage',
  },
  '/admin': {
    path: '/admin',
    label: 'Admin',
    component: 'AdminPage',
  },
  '/mesas': {
    path: '/mesas',
    label: 'Mesas',
    component: 'MesasPage',
  },
};

/**
 * Obtém a rota atual da URL.
 */
export function getCurrentRoute(): RouteType {
  const pathname = window.location.pathname;
  return (routes[pathname as RouteType] ? (pathname as RouteType) : '/');
}

/**
 * Navega para uma rota.
 */
export function navigateTo(route: RouteType) {
  window.history.pushState({}, '', route);
  window.dispatchEvent(new Event('routechange'));
}

/**
 * Obtém o componente para uma rota.
 */
export function getComponentForRoute(route: RouteType): string {
  return routes[route]?.component || 'ClientePage';
}
