import type { RepositorioVentas } from '@/dominio/puertos/repositorio-ventas';
import type { Venta } from '@/dominio/entidades/venta';

/** Caso de uso: registrar una nueva venta. */
export class RegistrarVenta {
  constructor(private readonly repositorio: RepositorioVentas) {}

  async ejecutar(venta: Omit<Venta, 'id'>): Promise<Venta> {
    return this.repositorio.registrar(venta);
  }
}
