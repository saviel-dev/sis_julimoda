import type { RepositorioVentas } from '@/dominio/puertos/repositorio-ventas';
import type { Venta } from '@/dominio/entidades/venta';

/** Caso de uso: obtener las ventas más recientes. */
export class ObtenerVentas {
  constructor(private readonly repositorio: RepositorioVentas) {}

  async ejecutar(limite?: number): Promise<Venta[]> {
    return this.repositorio.obtenerRecientes(limite);
  }
}
