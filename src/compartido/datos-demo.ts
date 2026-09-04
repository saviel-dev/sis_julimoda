/**
 * Utilidades compartidas de JuliModa.
 *
 * Los tipos de dominio (Producto, Venta, etc.) se importan desde
 * src/dominio/entidades/. Este módulo solo exporta constantes y
 * funciones de uso general que no pertenecen a ninguna capa concreta.
 */

export { type Producto, type TallaStock, type CategoriaProducto } from '@/dominio/entidades/producto';
export { type Venta } from '@/dominio/entidades/venta';

/** Categorías de productos disponibles en el sistema. */
export const CATEGORIAS: CategoriaProducto[] = [
  'Blusas',
  'Camisas',
  'Pantalones',
  'Vestidos',
  'Faldas',
  'Chaquetas',
  'Accesorios',
];

import type { CategoriaProducto } from '@/dominio/entidades/producto';

/**
 * Tasa de cambio USD → VES usada cuando no hay una configurada por el usuario.
 * El valor se actualizará a través del modal de tasa de cambio.
 */
export const TASA_CAMBIO = 36.5;

/** Formatea un número como precio según la moneda (USD o VES). */
export function formatearPrecio(valor: number, moneda: 'USD' | 'VES' = 'USD'): string {
  if (moneda === 'VES') {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 2,
    }).format(valor).replace('VES', 'Bs.S');
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(valor);
}
