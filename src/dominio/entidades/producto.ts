/**
 * Entidad que representa una prenda o accesorio en el inventario de JuliModa.
 */

export interface TallaStock {
  nombre: string;
  cantidad: number;
}

export type CategoriaProducto =
  | 'Blusas'
  | 'Camisas'
  | 'Pantalones'
  | 'Vestidos'
  | 'Faldas'
  | 'Chaquetas'
  | 'Accesorios';

export interface Producto {
  id: string;
  foto?: string;
  nombre: string;
  descripcion?: string;
  categoria: CategoriaProducto;
  precioCompra: number;
  precio: number;
  moneda: 'USD' | 'VES';
  tallas: TallaStock[];
  stock: number;
}
