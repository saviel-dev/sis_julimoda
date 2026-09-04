import type { RepositorioProductos } from '@/dominio/puertos/repositorio-productos';
import type { Producto } from '@/dominio/entidades/producto';

/** Caso de uso: obtener todos los productos del inventario. */
export class ObtenerProductos {
  constructor(private readonly repositorio: RepositorioProductos) {}

  async ejecutar(): Promise<Producto[]> {
    return this.repositorio.obtenerTodos();
  }
}
