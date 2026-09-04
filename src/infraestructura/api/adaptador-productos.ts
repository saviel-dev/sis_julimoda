import { supabase } from '@/infraestructura/supabase/cliente-supabase';
import type { RepositorioProductos } from '@/dominio/puertos/repositorio-productos';
import type { Producto } from '@/dominio/entidades/producto';

/**
 * Fila tal como la devuelve Supabase (snake_case de la base de datos).
 */
interface FilaProducto {
  id: string;
  nombre: string;
  descripcion: string | null;
  categoria: string;
  precio_compra: number;
  precio: number;
  moneda: string;
  stock: number;
  foto: string | null;
  tallas: { nombre: string; cantidad: number }[];
}

/** Convierte una fila de Supabase en la entidad de dominio */
function filaAProducto(fila: FilaProducto): Producto {
  return {
    id: fila.id,
    nombre: fila.nombre,
    descripcion: fila.descripcion ?? undefined,
    categoria: fila.categoria as Producto['categoria'],
    precioCompra: fila.precio_compra,
    precio: fila.precio,
    moneda: fila.moneda as Producto['moneda'],
    stock: fila.stock,
    foto: fila.foto ?? undefined,
    tallas: fila.tallas ?? [],
  };
}

/**
 * Adaptador que implementa RepositorioProductos usando Supabase
 * como fuente de datos real.
 */
export class AdaptadorProductos implements RepositorioProductos {
  async obtenerTodos(): Promise<Producto[]> {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('creado_en', { ascending: false });

    if (error) throw new Error(`Error al obtener productos: ${error.message}`);

    return (data as FilaProducto[]).map(filaAProducto);
  }

  async guardar(producto: Omit<Producto, 'id' | 'stock'> & { id?: string; stock?: number }): Promise<Producto> {
    // Calculamos el stock total sumando las cantidades de cada talla
    const stockCalculado = producto.tallas.reduce((suma, t) => suma + t.cantidad, 0);

    const fila = {
      id: producto.id ?? Math.floor(100000 + Math.random() * 900000).toString(),
      nombre: producto.nombre,
      descripcion: producto.descripcion ?? null,
      categoria: producto.categoria,
      precio_compra: producto.precioCompra,
      precio: producto.precio,
      moneda: producto.moneda,
      stock: stockCalculado,
      foto: producto.foto ?? null,
      tallas: producto.tallas,
    };

    const { data, error } = await supabase
      .from('productos')
      .upsert(fila, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw new Error(`Error al guardar producto: ${error.message}`);

    return filaAProducto(data as FilaProducto);
  }

  async eliminar(id: string): Promise<void> {
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) throw new Error(`Error al eliminar producto: ${error.message}`);
  }

  async actualizarStock(id: string, talla: string, cantidad: number): Promise<Producto> {
    const { data: producto, error: errorObtener } = await supabase
      .from('productos')
      .select('*')
      .eq('id', id)
      .single();

    if (errorObtener) throw new Error(`Error al obtener producto: ${errorObtener.message}`);

    const productoData = producto as FilaProducto;
    
    const tallasActualizadas = productoData.tallas.map(t => {
      if (t.nombre === talla) {
        const nuevaCantidad = Math.max(0, t.cantidad - cantidad);
        return { ...t, cantidad: nuevaCantidad };
      }
      return t;
    });

    const stockCalculado = tallasActualizadas.reduce((suma, t) => suma + t.cantidad, 0);

    const { data: dataActualizado, error: errorActualizar } = await supabase
      .from('productos')
      .update({
        tallas: tallasActualizadas,
        stock: stockCalculado
      })
      .eq('id', id)
      .select()
      .single();

    if (errorActualizar) throw new Error(`Error al actualizar stock: ${errorActualizar.message}`);

    return filaAProducto(dataActualizado as FilaProducto);
  }
}
