'use client';

import { useState } from 'react';
import {
  PRODUCTOS_DEMO,
  VENTAS_RECIENTES_DEMO,
  formatearPrecio,
  TASA_CAMBIO,
} from '@/compartido/datos-demo';
import { DollarSign, ShoppingCart, Package, AlertTriangle, ChevronLeft, ChevronRight, TrendingUp, X } from 'lucide-react';
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
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 10;
  
  /* Estados para el modal de tasa de cambio */
  const [modalTasaAbierto, setModalTasaAbierto] = useState(false);
  const [tipoTasa, setTipoTasa] = useState('dolar_bcv');
  const [tasaPersonalizada, setTasaPersonalizada] = useState('');

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

  const totalPaginas = Math.ceil(VENTAS_RECIENTES_DEMO.length / elementosPorPagina);
  const indiceInicial = (paginaActual - 1) * elementosPorPagina;
  const indiceFinal = indiceInicial + elementosPorPagina;
  const ventasPaginadas = VENTAS_RECIENTES_DEMO.slice(indiceInicial, indiceFinal);

  return (
    <section className={estilos.pagina}>
      {/* Encabezado */}
      <div className={estilos.encabezado}>
        <h1 className={estilos.etiquetaFecha}>
          Resumen del día — {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </h1>
        <button 
          type="button" 
          className={estilos.botonAjusteTasa} 
          aria-label="Ajustar tasa de cambio"
          onClick={() => setModalTasaAbierto(true)}
        >
          <TrendingUp size={18} />
          Ajustar tasa de cambio
        </button>
      </div>

      {/* Tarjetas de métricas */}
      <div className={estilos.gridMetricas}>
        <div className={`${estilos.tarjetaMetrica} ${estilos.tarjetaColorida} ${estilos.bgAzul}`}>
          <p className={estilos.encabezadoTarjeta}>Ventas del día</p>
          <div className={estilos.centroTarjeta}>
            <span className={estilos.iconoTarjeta}><DollarSign size={28} /></span>
            <span className={estilos.valorTarjeta}>{formatearPrecio(totalVentasDelDia, 'USD')}</span>
          </div>
          <div className={estilos.pieTarjeta}>
            <span>Transacciones completadas</span>
            <span className={estilos.subValorTarjeta}>{ventasDelDia.length}</span>
          </div>
        </div>

        <div className={`${estilos.tarjetaMetrica} ${estilos.tarjetaColorida} ${estilos.bgVerde}`}>
          <p className={estilos.encabezadoTarjeta}>Transacciones</p>
          <div className={estilos.centroTarjeta}>
            <span className={estilos.iconoTarjeta}><ShoppingCart size={28} /></span>
            <span className={estilos.valorTarjeta}>{VENTAS_RECIENTES_DEMO.length}</span>
          </div>
          <div className={estilos.pieTarjeta}>
            <span>Pendientes por despachar</span>
            <span className={estilos.subValorTarjeta}>{VENTAS_RECIENTES_DEMO.filter((v) => v.estado === 'Pendiente').length}</span>
          </div>
        </div>

        <div className={`${estilos.tarjetaMetrica} ${estilos.tarjetaColorida} ${estilos.bgNaranja}`}>
          <p className={estilos.encabezadoTarjeta}>Prendas en stock</p>
          <div className={estilos.centroTarjeta}>
            <span className={estilos.iconoTarjeta}><Package size={28} /></span>
            <span className={estilos.valorTarjeta}>{totalProductosEnStock}</span>
          </div>
          <div className={estilos.pieTarjeta}>
            <span>Referencias diferentes</span>
            <span className={estilos.subValorTarjeta}>{PRODUCTOS_DEMO.length}</span>
          </div>
        </div>

        <div className={`${estilos.tarjetaMetrica} ${estilos.tarjetaColorida} ${estilos.bgRojo}`}>
          <p className={estilos.encabezadoTarjeta}>Stock bajo</p>
          <div className={estilos.centroTarjeta}>
            <span className={estilos.iconoTarjeta}>
              <AlertTriangle size={28} />
            </span>
            <span className={estilos.valorTarjeta}>
              {productosConStockBajo}
            </span>
          </div>
          <div className={estilos.pieTarjeta}>
            <span>{productosConStockBajo > 0 ? `Unidades ≤ ${UMBRAL_STOCK_BAJO}` : 'Inventario sano'}</span>
            <span className={estilos.subValorTarjeta}>{productosConStockBajo}</span>
          </div>
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
            {ventasPaginadas.map((venta) => (
              <tr key={venta.id}>
                <td>{venta.id}</td>
                <td>{venta.productos}</td>
                <td>{venta.fecha}</td>
                <td>{formatearPrecio(venta.total, venta.moneda)}</td>
                <td>
                  <span className={venta.estado === 'Completada' ? estilos.badgeCompletada : estilos.badgePendiente}>
                    {venta.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className={estilos.paginacion}>
            <span className={estilos.infoPaginacion}>
              Mostrando {indiceInicial + 1}-{Math.min(indiceFinal, VENTAS_RECIENTES_DEMO.length)} de {VENTAS_RECIENTES_DEMO.length}
            </span>
            <div className={estilos.controlesPaginacion}>
              <button 
                className={estilos.botonPaginacion} 
                onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
                aria-label="Página anterior"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                className={estilos.botonPaginacion} 
                onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                disabled={paginaActual === totalPaginas}
                aria-label="Página siguiente"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Tasa de Cambio */}
      {modalTasaAbierto && (
        <div className={estilos.overlayModal}>
          <div className={estilos.modal} role="dialog" aria-modal="true" aria-labelledby="titulo-modal-tasa">
            <div className={estilos.encabezadoModal}>
              <h2 id="titulo-modal-tasa" className={estilos.tituloModal}>Ajustar tasa de cambio</h2>
              <button 
                type="button" 
                className={estilos.botonCerrar} 
                onClick={() => setModalTasaAbierto(false)}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className={estilos.campoGrupo}>
              <label htmlFor="selector-tasa" className={estilos.labelCampo}>Fuente de la tasa</label>
              <select 
                id="selector-tasa" 
                className={estilos.selectorBase}
                value={tipoTasa}
                onChange={(e) => {
                  setTipoTasa(e.target.value);
                  if (e.target.value !== 'personalizada') {
                    setTasaPersonalizada('');
                  }
                }}
              >
                <option value="dolar_bcv">Dólar BCV</option>
                <option value="euro_bcv">Euro BCV</option>
                <option value="promedio_usdt">Promedio USDT</option>
                <option value="personalizada">Personalizada</option>
              </select>
            </div>

            <div className={estilos.campoGrupo}>
              <label htmlFor="input-tasa" className={estilos.labelCampo}>Valor de la tasa</label>
              <input 
                id="input-tasa"
                type="number"
                step="0.01"
                min="0"
                className={estilos.inputBase}
                placeholder="0.00"
                value={tipoTasa === 'personalizada' ? tasaPersonalizada : ''}
                onChange={(e) => setTasaPersonalizada(e.target.value)}
                disabled={tipoTasa !== 'personalizada'}
              />
            </div>

            <div className={estilos.accionesModal}>
              <button 
                type="button" 
                className={estilos.botonCancelar} 
                onClick={() => setModalTasaAbierto(false)}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className={estilos.botonGuardar}
                onClick={() => {
                  // Aquí iría la lógica para aplicar la tasa en el sistema
                  setModalTasaAbierto(false);
                }}
              >
                Aplicar tasa
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
