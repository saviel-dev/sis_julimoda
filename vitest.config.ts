import { defineConfig } from 'vitest/config';
import path from 'path';

/**
 * Configuración de Vitest para el proyecto JuliModa.
 * Resuelve el alias @/ hacia src/ para que las pruebas
 * importen módulos de la misma forma que el código fuente.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
