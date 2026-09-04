import type { Venta } from '../entidades/venta';

/**
 * Puerto que define el contrato de acceso al historial de ventas.
 * La implementación concreta vive en infraestructura.
 */
export interface RepositorioVentas {
  /** Devuelve las ventas más recientes ordenadas por fecha descendente. */
  obtenerRecientes(limite?: number): Promise<Venta[]>;

  /** Registra una nueva venta. */
  registrar(venta: Omit<Venta, 'id'>): Promise<Venta>;
}
