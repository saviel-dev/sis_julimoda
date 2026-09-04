import type { Producto } from '../entidades/producto';

/**
 * Puerto que define el contrato de acceso al inventario de productos.
 * La implementación concreta vive en infraestructura.
 */
export interface RepositorioProductos {
  /** Devuelve todos los productos del inventario. */
  obtenerTodos(): Promise<Producto[]>;

  /** Crea o actualiza un producto. El stock se calcula a partir de las tallas. */
  guardar(producto: Omit<Producto, 'id' | 'stock'> & { id?: string; stock?: number }): Promise<Producto>;

  /** Elimina un producto por su identificador. */
  eliminar(id: string): Promise<void>;

  /** Actualiza el stock de un producto específico descontando la cantidad vendida de una talla. */
  actualizarStock(id: string, talla: string, cantidad: number): Promise<Producto>;
}
