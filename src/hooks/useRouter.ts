/**
 * @file src/hooks/useRouter.ts
 * @description Hook para gerenciar roteamento e navegação.
 */

import { useEffect, useState } from 'react';
import { navigateTo, getCurrentRoute, RouteType } from '../router/routes';

/**
 * Hook para gerenciar roteamento.
 */
export function useRouter() {
  const [rota, setRota] = useState<RouteType>(getCurrentRoute());

  useEffect(() => {
    const handleRouteChange = () => {
      setRota(getCurrentRoute());
    };

    window.addEventListener('routechange', handleRouteChange);
    return () => window.removeEventListener('routechange', handleRouteChange);
  }, []);

  return {
    rota,
    navegar: navigateTo,
    estaEm: (rotas: RouteType | RouteType[]) => {
      const rotasArray = Array.isArray(rotas) ? rotas : [rotas];
      return rotasArray.includes(rota);
    },
  };
}
