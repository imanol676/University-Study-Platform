import * as React from "react";

/**
 * Helper seguro para envolver funciones en React.cache() en Server Components de Next.js,
 * con fallback transparente para entornos de pruebas unitarias (Vitest/Jest).
 */
export const requestCache = <T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T
): T => {
  const reactWithCache = React as unknown as {
    cache?: (func: T) => T;
  };

  if (typeof reactWithCache.cache === "function") {
    return reactWithCache.cache(fn);
  }

  return fn;
};
