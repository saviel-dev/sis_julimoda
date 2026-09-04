'use client';

import { useState, useEffect, useCallback } from 'react';
import { DollarSign, Wallet, Landmark, Download, Loader2 } from 'lucide-react';
import {
  TASA_CAMBIO,
  formatearPrecio
} from '@/compartido/datos-demo';
import { type Venta } from '@/dominio/entidades/venta';
import { AdaptadorVentas } from '@/infraestructura/api/adaptador-ventas';
import { ObtenerVentas } from '@/aplicacion/casos-uso/obtener-ventas';
import estilos from './reportes.module.css';

const casoVentas = new ObtenerVentas(new AdaptadorVentas());

/**
 * Vista de Reportes.
 * Carga las ventas desde Supabase y muestra el flujo de caja
 * segmentado en divisas y bolívares.
 */
export default function Reportes() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarVentas = useCallback(async () => {
    setCargando(true);
    try {
      const datos = await casoVentas.ejecutar(100);
      setVentas(datos);
    } catch {
      // Si falla, lista vacía
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarVentas();
  }, [cargarVentas]);

  const ventasCompletadas = ventas.filter(v => v.estado === 'Completada');

  let totalFacturadoUSD = 0;
  ventasCompletadas.forEach(venta => {
    if (venta.moneda === 'VES') {
      totalFacturadoUSD += venta.total / TASA_CAMBIO;
    } else {
      totalFacturadoUSD += venta.total;
    }
  });

  const totalFacturadoBs = totalFacturadoUSD * TASA_CAMBIO;
  const ventasEnUSD = ventasCompletadas.filter(v => v.moneda === 'USD').reduce((acc, v) => acc + v.total, 0);
  const ventasEnBs = ventasCompletadas.filter(v => v.moneda === 'VES').reduce((acc, v) => acc + v.total, 0);

  const exportarExcel = () => {
    const encabezados = ['ID Operacion', 'Fecha', 'Productos', 'Total USD', 'Total Bs.', 'Moneda Pago', 'Estado'];

    const filas = ventasCompletadas.map(v => {
      const montoUSD = v.moneda === 'VES' ? v.total / TASA_CAMBIO : v.total;
      const montoBs = v.moneda === 'USD' ? v.total * TASA_CAMBIO : v.total;
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
          <p className={estilos.descripcion}>Resumen financiero del período actual</p>
        </div>
        <button
          className={estilos.botonExportar}
          onClick={exportarExcel}
          disabled={cargando || ventasCompletadas.length === 0}
        >
          <Download size={16} />
          Exportar Excel
        </button>
      </header>

      {cargando && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
          <Loader2 size={24} className={estilos.iconoGirando} />
        </div>
      )}

      {!cargando && (
        <>
          {/* Tarjetas de resumen */}
          <section className={estilos.gridResumen}>

            {/* Total facturado */}
            <div className={estilos.tarjetaColorida} style={{ backgroundColor: '#4b8df8', borderColor: '#4b8df8' }}>
              <p className={estilos.encabezadoTarjeta}>Total Facturado (USD)</p>
              <div className={estilos.centroTarjeta}>
                <span className={estilos.iconoTarjeta}><DollarSign size={24} /></span>
                <span className={estilos.valorTarjeta}>{formatearPrecio(totalFacturadoUSD, 'USD')}</span>
              </div>
              <div className={estilos.pieTarjeta}>
                <span>Equivalente Bs.</span>
                <span className={estilos.subValorTarjeta}>{formatearPrecio(totalFacturadoBs, 'VES')}</span>
              </div>
            </div>

            {/* Ingresos en USD */}
            <div className={estilos.tarjetaColorida} style={{ backgroundColor: '#26c281', borderColor: '#26c281' }}>
              <p className={estilos.encabezadoTarjeta}>Ingresos en USD</p>
              <div className={estilos.centroTarjeta}>
                <span className={estilos.iconoTarjeta}><Wallet size={24} /></span>
                <span className={estilos.valorTarjeta}>{formatearPrecio(ventasEnUSD, 'USD')}</span>
              </div>
              <div className={estilos.pieTarjeta}>
                <span>Pagos directos en dólares</span>
              </div>
            </div>

            {/* Ingresos en Bolívares */}
            <div className={estilos.tarjetaColorida} style={{ backgroundColor: '#f39c12', borderColor: '#f39c12' }}>
              <p className={estilos.encabezadoTarjeta}>Ingresos en Bolívares</p>
              <div className={estilos.centroTarjeta}>
                <span className={estilos.iconoTarjeta}><Landmark size={24} /></span>
                <span className={estilos.valorTarjeta}>{formatearPrecio(ventasEnBs, 'VES')}</span>
              </div>
              <div className={estilos.pieTarjeta}>
                <span>Pagos directos en Bs.</span>
              </div>
            </div>
          </section>

          {/* Detalle de transacciones */}
          <section className={estilos.seccionDetalle}>
            <h2 className={estilos.tituloSeccion}>Detalle de transacciones</h2>
            <div className={estilos.listaVentas}>
              {ventasCompletadas.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--color-texto-secundario)', padding: '32px' }}>
                  No hay ventas registradas aún.
                </p>
              ) : (
                ventasCompletadas.map((venta) => {
                  const montoUSD = venta.moneda === 'VES' ? venta.total / TASA_CAMBIO : venta.total;
                  const montoBs  = venta.moneda === 'USD' ? venta.total * TASA_CAMBIO : venta.total;
                  return (
                    <div key={venta.id} className={estilos.itemVenta}>
                      <div className={estilos.izqVenta}>
                        <div className={estilos.iconoRecibo}><DollarSign size={16} /></div>
                        <div className={estilos.infoVenta}>
                          <div className={estilos.encabezadoVenta}>
                            <span className={estilos.fechaVenta}>{venta.id}</span>
                            <span className={estilos.badgeOperacion}>{venta.fecha}</span>
                          </div>
                          <span className={estilos.productosVenta}>{venta.productos}</span>
                        </div>
                      </div>
                      <div className={estilos.montosVenta}>
                        <span className={`${estilos.montoPrincipal} ${estilos.badgeDolar}`}>{formatearPrecio(montoUSD, 'USD')}</span>
                        <span className={`${estilos.montoSecundario} ${estilos.badgeBs}`}>{formatearPrecio(montoBs, 'VES')}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
