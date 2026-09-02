'use client';

import { DollarSign, Wallet, Landmark, Download } from 'lucide-react';
import { 
  VENTAS_RECIENTES_DEMO, 
  TASA_CAMBIO, 
  formatearPrecio 
} from '@/compartido/datos-demo';
import estilos from './reportes.module.css';

/**
 * Vista de Reportes sencilla.
 * Muestra el flujo de caja segmentado en divisas y bolívares.
 */
export default function Reportes() {
  const ventasCompletadas = VENTAS_RECIENTES_DEMO.filter(v => v.estado === 'Completada');
  
  let totalFacturadoUSD = 0;
  
  ventasCompletadas.forEach(venta => {
    if (venta.moneda === 'VES') {
      totalFacturadoUSD += venta.total / TASA_CAMBIO;
    } else {
      totalFacturadoUSD += venta.total;
    }
  });

  const totalFacturadoBs = totalFacturadoUSD * TASA_CAMBIO;

  // Calculamos los ingresos por moneda según con qué moneda se pagó la venta
  const ventasEnUSD = ventasCompletadas.filter(v => v.moneda === 'USD').reduce((acc, v) => acc + v.total, 0);
  const ventasEnBs = ventasCompletadas.filter(v => v.moneda === 'VES').reduce((acc, v) => acc + v.total, 0);

  const exportarExcel = () => {
    // Generamos un CSV nativo, óptimo para Excel sin dependencias pesadas
    const encabezados = ['ID Operacion', 'Fecha', 'Productos', 'Total USD', 'Total Bs.', 'Moneda Pago', 'Estado'];
    
    const filas = ventasCompletadas.map(v => {
      const montoUSD = v.moneda === 'VES' ? v.total / TASA_CAMBIO : v.total;
      const montoBs = v.moneda === 'USD' ? v.total * TASA_CAMBIO : v.total;
      
      // Sanitizar productos para evitar problemas con las comas en CSV
      const productosLimpios = `"${v.productos.replace(/"/g, '""')}"`;
      
      return [
        v.id,
        v.fecha,
        productosLimpios,
        montoUSD.toFixed(2),
        montoBs.toFixed(2),
        v.moneda,
        v.estado
      ].join(';');
    });

    const csvContent = encabezados.join(';') + '\n' + filas.join('\n');
    
    // Añadimos el BOM (\ufeff) para que Excel reconozca automáticamente UTF-8
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Reporte_Ventas_JuliModa_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className={estilos.contenedor}>
      <header className={estilos.encabezado}>
        <div className={estilos.textosEncabezado}>
          <h1 className={estilos.titulo}>Reporte de Ventas</h1>
          <p className={estilos.descripcion}>Resumen financiero y flujo de caja en ambas monedas (USD y Bs.)</p>
        </div>
        <button onClick={exportarExcel} className={estilos.botonExportar}>
          <Download size={18} strokeWidth={2.5} />
          Exportar Excel
        </button>
      </header>

      <section className={estilos.gridResumen}>
        <article className={`${estilos.tarjetaColorida} ${estilos.bgAzul}`}>
          <h2 className={estilos.encabezadoTarjeta}>Ventas Totales (Equivalente)</h2>
          <div className={estilos.centroTarjeta}>
            <div className={estilos.iconoTarjeta}>
              <DollarSign size={32} strokeWidth={2.5} />
            </div>
            <p className={estilos.valorTarjeta}>{formatearPrecio(totalFacturadoUSD, 'USD')}</p>
          </div>
          <div className={estilos.pieTarjeta}>
            <span>En moneda local</span>
            <span className={estilos.subValorTarjeta}>{formatearPrecio(totalFacturadoBs, 'VES')}</span>
          </div>
        </article>
        
        <article className={`${estilos.tarjetaColorida} ${estilos.bgVerde}`}>
          <h2 className={estilos.encabezadoTarjeta}>Ingresos en Divisas</h2>
          <div className={estilos.centroTarjeta}>
            <div className={estilos.iconoTarjeta}>
              <Wallet size={32} strokeWidth={2.5} />
            </div>
            <p className={estilos.valorTarjeta}>{formatearPrecio(ventasEnUSD, 'USD')}</p>
          </div>
          <div className={estilos.pieTarjeta}>
            <span>Zelle / Efectivo USD</span>
            <span className={estilos.subValorTarjeta}>{ventasCompletadas.filter(v => v.moneda === 'USD').length} transacciones</span>
          </div>
        </article>

        <article className={`${estilos.tarjetaColorida} ${estilos.bgNaranja}`}>
          <h2 className={estilos.encabezadoTarjeta}>Ingresos en Moneda Local</h2>
          <div className={estilos.centroTarjeta}>
            <div className={estilos.iconoTarjeta}>
              <Landmark size={32} strokeWidth={2.5} />
            </div>
            <p className={estilos.valorTarjeta}>{formatearPrecio(ventasEnBs, 'VES')}</p>
          </div>
          <div className={estilos.pieTarjeta}>
            <span>Punto / Pago Móvil</span>
            <span className={estilos.subValorTarjeta}>{ventasCompletadas.filter(v => v.moneda === 'VES').length} transacciones</span>
          </div>
        </article>
      </section>

      <section className={estilos.seccionDetalle}>
        <h2 className={estilos.tituloSeccion}>Desglose de Operaciones Recientes</h2>
        <div className={estilos.listaVentas}>
          {ventasCompletadas.map(venta => {
            const montoUSD = venta.moneda === 'VES' ? venta.total / TASA_CAMBIO : venta.total;
            const montoBs = venta.moneda === 'USD' ? venta.total * TASA_CAMBIO : venta.total;
            
            return (
              <div key={venta.id} className={estilos.itemVenta}>
                <div className={estilos.izqVenta}>
                  <div className={estilos.iconoRecibo}>
                    <DollarSign size={20} />
                  </div>
                  <div className={estilos.infoVenta}>
                    <div className={estilos.encabezadoVenta}>
                      <span className={estilos.fechaVenta}>{venta.fecha}</span>
                      <span className={estilos.badgeOperacion}>#{venta.id}</span>
                    </div>
                    <span className={estilos.productosVenta}>{venta.productos}</span>
                  </div>
                </div>
                
                <div className={estilos.montosVenta}>
                  <span className={estilos.montoPrincipal}>{formatearPrecio(montoUSD, 'USD')}</span>
                  <span className={estilos.montoSecundario}>{formatearPrecio(montoBs, 'VES')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
