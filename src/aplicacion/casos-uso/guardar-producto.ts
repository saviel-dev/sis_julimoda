import type { RepositorioProductos } from '@/dominio/puertos/repositorio-productos';
import type { Producto } from '@/dominio/entidades/producto';

/** Caso de uso: guardar (crear o actualizar) un producto. */
export class GuardarProducto {
  constructor(private readonly repositorio: RepositorioProductos) {}

  async ejecutar(producto: Omit<Producto, 'id' | 'stock'> & { id?: string; stock?: number }): Promise<Producto> {
    return this.repositorio.guardar(producto);
  }
}
