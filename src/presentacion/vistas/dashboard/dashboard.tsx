import {
  PRODUCTOS_DEMO,
  VENTAS_RECIENTES_DEMO,
  formatearPrecio,
  TASA_CAMBIO,
} from '@/compartido/datos-demo';
import { DollarSign, ShoppingCart, Package, AlertTriangle } from 'lucide-react';
import estilos from './dashboard.module.css';

/** Umbral de stock bajo para alertar al administrador */
const UMBRAL_STOCK_BAJO = 3;

/**
 * Panel principal del sistema administrativo de JuliModa.
 *
 * Muestra métricas clave del negocio y las ventas recientes del día
 * usando datos de demostración.
 */
export default function Dashboard() {
  /* Cálculo de métricas desde los datos de demostración */
  const ventasDelDia = VENTAS_RECIENTES_DEMO.filter(
    (v) => v.estado === 'Completada'
  );
  const totalVentasDelDia = ventasDelDia.reduce((suma, v) => {
    const valorEnUSD = v.moneda === 'VES' ? v.total / TASA_CAMBIO : v.total;
    return suma + valorEnUSD;
  }, 0);
  const totalProductosEnStock = PRODUCTOS_DEMO.reduce(
    (suma, p) => suma + p.stock,
    0
  );
  const productosConStockBajo = PRODUCTOS_DEMO.filter(
    (p) => p.stock <= UMBRAL_STOCK_BAJO
  ).length;

  return (
    <section className={estilos.pagina}>
      {/* Encabezado */}
      <div className={estilos.encabezado}>
        <h1 className={estilos.titulo}>Dashboard</h1>
        <p className={estilos.subtitulo}>
          Resumen del día — {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Tarjetas de métricas */}
      <div className={estilos.gridMetricas}>
        <div className={`${estilos.tarjetaMetrica} ${estilos.bordeVerde}`}>
          <p className={estilos.etiquetaMetrica}>
            <span className={estilos.iconoMetrica} style={{color: '#eab308'}}><DollarSign size={16} /></span>
            Ventas del día
          </p>
          <p className={estilos.valorMetrica}>{formatearPrecio(totalVentasDelDia, 'USD')}</p>
          <p className={estilos.descripcionMetrica}>{ventasDelDia.length} transacciones completadas</p>
        </div>

        <div className={`${estilos.tarjetaMetrica} ${estilos.bordeAzul}`}>
          <p className={estilos.etiquetaMetrica}>
            <span className={estilos.iconoMetrica} style={{color: '#94a3b8'}}><ShoppingCart size={16} /></span>
            Transacciones
          </p>
          <p className={estilos.valorMetrica}>{VENTAS_RECIENTES_DEMO.length}</p>
          <p className={estilos.descripcionMetrica}>
            {VENTAS_RECIENTES_DEMO.filter((v) => v.estado === 'Pendiente').length} pendiente(s)
          </p>
        </div>

        <div className={`${estilos.tarjetaMetrica} ${estilos.bordeMorado}`}>
          <p className={estilos.etiquetaMetrica}>
            <span className={estilos.iconoMetrica} style={{color: '#d97706'}}><Package size={16} /></span>
            Prendas en stock
          </p>
          <p className={estilos.valorMetrica}>{totalProductosEnStock}</p>
          <p className={estilos.descripcionMetrica}>{PRODUCTOS_DEMO.length} referencias diferentes</p>
        </div>

        <div className={`${estilos.tarjetaMetrica} ${estilos.bordeRojo}`}>
          <p className={estilos.etiquetaMetrica}>
            <span className={estilos.iconoMetrica} style={{color: 'var(--color-alerta)'}}><AlertTriangle size={16} /></span>
            Stock bajo
          </p>
          <p className={`${estilos.valorMetrica} ${productosConStockBajo > 0 ? estilos.valorMetricaAlerta : ''}`}>
            {productosConStockBajo}
          </p>
          <p className={estilos.descripcionMetrica}>
            {productosConStockBajo > 0
              ? `${productosConStockBajo} producto(s) con ≤ ${UMBRAL_STOCK_BAJO} unidades`
              : 'Todo el inventario en buen nivel'}
          </p>
        </div>
      </div>

      {/* Últimas ventas */}
      <div className={estilos.seccionTabla}>
        <div className={estilos.encabezadoTabla}>
          <h2 className={estilos.tituloTabla}>Ventas recientes</h2>
        </div>
        <table className={estilos.tabla}>
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Productos</th>
              <th scope="col">Hora</th>
              <th scope="col">Total</th>
              <th scope="col">Estado</th>
            </tr>
          </thead>
          <tbody>
            {VENTAS_RECIENTES_DEMO.map((venta) => (
              <tr key={venta.id}>
                <td>{venta.id}</td>
                <td>{venta.productos}</td>
                <td>{venta.fecha}</td>
                <td>{formatearPrecio(venta.total, venta.moneda)}</td>
                <td>
                  {venta.estado === 'Completada' ? (
                    <span className={estilos.badgeCompletada}>Completada</span>
                  ) : (
                    <span className={estilos.badgePendiente}>Pendiente</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
