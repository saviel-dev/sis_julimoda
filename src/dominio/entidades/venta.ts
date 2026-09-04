/**
 * Entidad que representa una venta registrada en el sistema.
 */
export interface Venta {
  id: string;
  fecha: string;
  productos: string;
  total: number;
  moneda: 'USD' | 'VES';
  estado: 'Completada' | 'Pendiente';
}
