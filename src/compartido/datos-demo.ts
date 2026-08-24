/**
 * Datos de demostración para el sistema administrativo de JuliModa.
 *
 * Estos datos simulan el catálogo de productos y las ventas recientes
 * mientras el backend real no está disponible.
 */

export interface TallaStock {
  nombre: string;
  cantidad: number;
}

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

export type CategoriaProducto =
  | 'Blusas'
  | 'Camisas'
  | 'Pantalones'
  | 'Vestidos'
  | 'Faldas'
  | 'Chaquetas'
  | 'Accesorios';

export const CATEGORIAS: CategoriaProducto[] = [
  'Blusas',
  'Camisas',
  'Pantalones',
  'Vestidos',
  'Faldas',
  'Chaquetas',
  'Accesorios',
];

export const TASA_CAMBIO = 36.5; // 1 USD = 36.5 VES (Ejemplo)

export const PRODUCTOS_DEMO: Producto[] = [
  { 
    id: '458291', 
    nombre: 'Blusa floral manga larga', 
    descripcion: 'Blusa de algodón con estampado floral, ideal para primavera.',
    categoria: 'Blusas', 
    precioCompra: 10,
    precio: 15, 
    moneda: 'USD',
    tallas: [{ nombre: 'S', cantidad: 5 }, { nombre: 'M', cantidad: 7 }],
    stock: 12 
  },
  { 
    id: '812934', 
    nombre: 'Blusa casual sin manga', 
    categoria: 'Blusas', 
    precioCompra: 200,
    precio: 450, 
    moneda: 'VES',
    tallas: [{ nombre: 'M', cantidad: 8 }],
    stock: 8 
  },
  { 
    id: '392015', 
    nombre: 'Camisa de lino', 
    categoria: 'Camisas', 
    precioCompra: 12,
    precio: 20, 
    moneda: 'USD',
    tallas: [{ nombre: 'M', cantidad: 3 }, { nombre: 'L', cantidad: 2 }],
    stock: 5 
  },
  { 
    id: '719284', 
    nombre: 'Pantalón tiro alto', 
    categoria: 'Pantalones', 
    precioCompra: 15,
    precio: 25, 
    moneda: 'USD',
    tallas: [{ nombre: 'S', cantidad: 5 }, { nombre: 'M', cantidad: 5 }, { nombre: 'L', cantidad: 5 }],
    stock: 15 
  },
  { 
    id: '204918', 
    nombre: 'Vestido midi floral', 
    categoria: 'Vestidos', 
    precioCompra: 600,
    precio: 1100, 
    moneda: 'VES',
    tallas: [{ nombre: 'S', cantidad: 4 }],
    stock: 4 
  },
  { 
    id: '581923', 
    nombre: 'Chaqueta denim', 
    categoria: 'Chaquetas', 
    precioCompra: 20,
    precio: 35, 
    moneda: 'USD',
    tallas: [{ nombre: 'M', cantidad: 4 }],
    stock: 4 
  },
  { 
    id: '928104', 
    nombre: 'Cinturón trenzado', 
    categoria: 'Accesorios', 
    precioCompra: 2,
    precio: 5, 
    moneda: 'USD',
    tallas: [{ nombre: 'Único', cantidad: 20 }],
    stock: 20 
  },
];

export interface VentaReciente {
  id: string;
  fecha: string;
  productos: string;
  total: number;
  moneda: 'USD' | 'VES';
  estado: 'Completada' | 'Pendiente';
}

export const VENTAS_RECIENTES_DEMO: VentaReciente[] = [
  { id: 'V001', fecha: 'Hoy, 10:23', productos: 'Blusa floral manga larga x1', total: 15, moneda: 'USD', estado: 'Completada' },
  { id: 'V002', fecha: 'Hoy, 11:05', productos: 'Pantalón tiro alto x1, Cinturón x1', total: 30, moneda: 'USD', estado: 'Completada' },
  { id: 'V003', fecha: 'Hoy, 12:30', productos: 'Vestido midi floral x1', total: 1100, moneda: 'VES', estado: 'Completada' },
  { id: 'V004', fecha: 'Hoy, 14:15', productos: 'Camisa de lino x2', total: 40, moneda: 'USD', estado: 'Completada' },
];

/** Formatea un número como precio según la moneda (USD o VES) */
export function formatearPrecio(valor: number, moneda: 'USD' | 'VES' = 'USD'): string {
  if (moneda === 'VES') {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 2,
    }).format(valor).replace('VES', 'Bs.');
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(valor);
}
