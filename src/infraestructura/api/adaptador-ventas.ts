import { supabase } from '@/infraestructura/supabase/cliente-supabase';
import type { RepositorioVentas } from '@/dominio/puertos/repositorio-ventas';
import type { Venta } from '@/dominio/entidades/venta';

/**
 * Fila tal como la devuelve Supabase (snake_case de la base de datos).
 */
interface FilaVenta {
  id: string;
  fecha: string;
  productos: string;
  total: number;
  moneda: string;
  estado: string;
}

/** Convierte una fila de Supabase en la entidad de dominio */
function filaAVenta(fila: FilaVenta): Venta {
  // Formateamos la fecha para mostrarla de manera legible
  const fecha = new Date(fila.fecha);
  const hoy = new Date();
  const esHoy =
    fecha.toDateString() === hoy.toDateString();

  const horaFormateada = fecha.toLocaleTimeString('es-VE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    id: fila.id,
    fecha: esHoy ? `Hoy, ${horaFormateada}` : fecha.toLocaleDateString('es-VE'),
    productos: fila.productos,
    total: fila.total,
    moneda: fila.moneda as Venta['moneda'],
    estado: fila.estado as Venta['estado'],
  };
}

/**
 * Adaptador que implementa RepositorioVentas usando Supabase.
 */
export class AdaptadorVentas implements RepositorioVentas {
  async obtenerRecientes(limite = 50): Promise<Venta[]> {
    const { data, error } = await supabase
      .from('ventas')
      .select('*')
      .order('fecha', { ascending: false })
      .limit(limite);

    if (error) throw new Error(`Error al obtener ventas: ${error.message}`);

    return (data as FilaVenta[]).map(filaAVenta);
  }

  async registrar(venta: Omit<Venta, 'id'>): Promise<Venta> {
    const { data: sesionData } = await supabase.auth.getUser();

    const fila = {
      productos: venta.productos,
      total: venta.total,
      moneda: venta.moneda,
      estado: venta.estado,
      usuario_id: sesionData.user?.id ?? null,
    };

    const { data, error } = await supabase
      .from('ventas')
      .insert(fila)
      .select()
      .single();

    if (error) throw new Error(`Error al registrar venta: ${error.message}`);

    return filaAVenta(data as FilaVenta);
  }
}
