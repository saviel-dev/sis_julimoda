import type { RepositorioProductos } from '@/dominio/puertos/repositorio-productos';

/** Caso de uso: actualizar el stock de un producto descontando cantidad vendida de una talla. */
export class ActualizarStock {
  constructor(private readonly repositorio: RepositorioProductos) {}

  async ejecutar(id: string, talla: string, cantidad: number): Promise<void> {
    await this.repositorio.actualizarStock(id, talla, cantidad);
  }
}
