import type { RepositorioProductos } from '@/dominio/puertos/repositorio-productos';

/** Caso de uso: eliminar un producto del inventario. */
export class EliminarProducto {
  constructor(private readonly repositorio: RepositorioProductos) {}

  async ejecutar(id: string): Promise<void> {
    return this.repositorio.eliminar(id);
  }
}
