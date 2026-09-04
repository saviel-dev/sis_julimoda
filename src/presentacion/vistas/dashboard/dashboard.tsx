'use client';

import { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import {
  formatearPrecio,
  TASA_CAMBIO,
  type Producto,
} from '@/compartido/datos-demo';
import { type Venta } from '@/dominio/entidades/venta';
import { AdaptadorProductos } from '@/infraestructura/api/adaptador-productos';
import { AdaptadorVentas } from '@/infraestructura/api/adaptador-ventas';
import { ObtenerProductos } from '@/aplicacion/casos-uso/obtener-productos';
import { ObtenerVentas } from '@/aplicacion/casos-uso/obtener-ventas';
import { obtenerTasasCambio, obtenerTasaEspecifica, type TasasCambio } from '@/infraestructura/api/servicio-tasas';
import { DollarSign, ShoppingCart, Package, AlertTriangle, ChevronLeft, ChevronRight, TrendingUp, X, Loader2, RefreshCw } from 'lucide-react';
import estilos from './dashboard.module.css';

/** Componente para animar números con efecto de conteo */
function CountUpAnimation({ value, duration = 1000, decimals = 0 }: { value: number; duration?: number; decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function para suavizar la animación
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = value * easeOutQuart;
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [value, duration]);

  return <span>{decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue)}</span>;
}

/** Umbral de stock bajo para alertar al administrador */
const UMBRAL_STOCK_BAJO = 3;

// Instancias de casos de uso fuera del componente
const casoProductos = new ObtenerProductos(new AdaptadorProductos());
const casoVentas = new ObtenerVentas(new AdaptadorVentas());

/**
 * Panel principal del sistema administrativo de JuliModa.
 *
 * Muestra métricas clave del negocio y las ventas recientes del día
 * usando datos reales desde Supabase.
 */
export default function Dashboard() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 10;

  /* Estados para el modal de tasa de cambio */
  const [modalTasaAbierto, setModalTasaAbierto] = useState(false);
  const [tipoTasa, setTipoTasa] = useState('dolar_bcv');
  const [tasaPersonalizada, setTasaPersonalizada] = useState(TASA_CAMBIO.toFixed(2));
  const [tasasActuales, setTasasActuales] = useState<TasasCambio | null>(null);
  const [cargandoTasas, setCargandoTasas] = useState(false);
  const [errorTasas, setErrorTasas] = useState<string | null>(null);
  const [tasaAplicada, setTasaAplicada] = useState(TASA_CAMBIO);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [prods, vents] = await Promise.all([
        casoProductos.ejecutar(),
        casoVentas.ejecutar(50),
      ]);
      setProductos(prods);
      setVentas(vents);
    } catch {
      // Si falla la carga, las métricas mostrarán ceros
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Cargar automáticamente la tasa de Dólar BCV al iniciar
  useEffect(() => {
    const cargarTasaInicial = async () => {
      try {
        const tasas = await obtenerTasasCambio();
        setTasasActuales(tasas);
        setTasaPersonalizada(tasas.dolarBCV.toFixed(2));
        setTasaAplicada(tasas.dolarBCV);
      } catch (error) {
        console.error('Error al cargar tasa inicial:', error);
        // Si falla, mantener la tasa por defecto
      }
    };
    
    cargarTasaInicial();
  }, []);

  // Cargar tasas de cambio cuando se abre el modal
  const cargarTasas = async () => {
    setCargandoTasas(true);
    setErrorTasas(null);
    try {
      const tasas = await obtenerTasasCambio();
      setTasasActuales(tasas);
      
      // Auto-seleccionar la tasa según el tipo actual (máximo 2 decimales)
      if (tipoTasa === 'dolar_bcv') {
        setTasaPersonalizada(tasas.dolarBCV.toFixed(2));
      } else if (tipoTasa === 'euro_bcv') {
        setTasaPersonalizada(tasas.euroBCV.toFixed(2));
      } else if (tipoTasa === 'promedio_usdt') {
        setTasaPersonalizada(tasas.usdtPromedio.toFixed(2));
      }
    } catch (error) {
      console.error('Error al cargar tasas:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar tasas';
      setErrorTasas(errorMessage);
    } finally {
      setCargandoTasas(false);
    }
  };

  useEffect(() => {
    if (modalTasaAbierto) {
      cargarTasas();
    }
  }, [modalTasaAbierto]);

  // Actualizar tasa cuando cambia el tipo (máximo 2 decimales)
  useEffect(() => {
    if (tasasActuales && tipoTasa !== 'personalizada') {
      if (tipoTasa === 'dolar_bcv') {
        setTasaPersonalizada(tasasActuales.dolarBCV.toFixed(2));
      } else if (tipoTasa === 'euro_bcv') {
        setTasaPersonalizada(tasasActuales.euroBCV.toFixed(2));
      } else if (tipoTasa === 'promedio_usdt') {
        setTasaPersonalizada(tasasActuales.usdtPromedio.toFixed(2));
      }
    }
  }, [tipoTasa, tasasActuales]);

  // Auto-update de tasas cada 5 minutos cuando el modal está abierto
  useEffect(() => {
    if (!modalTasaAbierto) return;

    const intervalo = setInterval(() => {
      cargarTasas();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(intervalo);
  }, [modalTasaAbierto]);

  const aplicarTasa = () => {
    const tasa = tipoTasa === 'personalizada' 
      ? parseFloat(tasaPersonalizada) 
      : parseFloat(tasaPersonalizada);
    
    if (isNaN(tasa) || tasa <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Tasa inválida',
        text: 'Por favor ingresa una tasa válida mayor a 0',
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }
    
    setTasaAplicada(tasa);
    localStorage.setItem('tasaCambio', tasa.toString());
    setModalTasaAbierto(false);
    
    Swal.fire({
      icon: 'success',
      title: 'Tasa aplicada',
      text: `La tasa de cambio ha sido actualizada a ${tasa.toFixed(2)} Bs`,
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  };

  /* Cálculo de métricas desde los datos reales */
  const ventasDelDia = ventas.filter((v) => v.estado === 'Completada');
  const totalVentasDelDia = ventasDelDia.reduce((suma, v) => {
    const valorEnUSD = v.moneda === 'VES' ? v.total / tasaAplicada : v.total;
    return suma + valorEnUSD;
  }, 0);
  const totalProductosEnStock = productos.reduce((suma, p) => suma + p.stock, 0);
  const productosConStockBajo = productos.filter(
    (p) => p.stock <= UMBRAL_STOCK_BAJO && p.stock > 0
  ).length;

  const totalPaginas = Math.ceil(ventas.length / elementosPorPagina);
  const indiceInicial = (paginaActual - 1) * elementosPorPagina;
  const indiceFinal = indiceInicial + elementosPorPagina;
  const ventasPaginadas = ventas.slice(indiceInicial, indiceFinal);

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

      {/* Indicador de carga */}
      {cargando && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      )}

      {/* Tarjetas de métricas */}
      {!cargando && (
        <>
          <div className={estilos.gridMetricas}>
            <div className={`${estilos.tarjetaMetrica} ${estilos.tarjetaColorida} ${estilos.bgAzul}`}>
              <p className={estilos.encabezadoTarjeta}>Ventas del día</p>
              <div className={estilos.centroTarjeta} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={estilos.iconoTarjeta}><DollarSign size={28} /></span>
                  <span className={estilos.valorTarjeta}>
                    ${<CountUpAnimation value={totalVentasDelDia} duration={1500} decimals={2} />}
                  </span>
                </div>
                <span style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.85)', paddingLeft: '40px', fontWeight: 500 }}>
                  Bs <CountUpAnimation value={totalVentasDelDia * tasaAplicada} duration={1500} decimals={2} />
                </span>
              </div>
              <div className={estilos.pieTarjeta}>
                <span>Transacciones completadas</span>
                <span className={estilos.subValorTarjeta}><CountUpAnimation value={ventasDelDia.length} duration={1000} /></span>
              </div>
            </div>

            <div className={`${estilos.tarjetaMetrica} ${estilos.tarjetaColorida} ${estilos.bgVerde}`}>
              <p className={estilos.encabezadoTarjeta}>Transacciones</p>
              <div className={estilos.centroTarjeta}>
                <span className={estilos.iconoTarjeta}><ShoppingCart size={28} /></span>
                <span className={estilos.valorTarjeta}><CountUpAnimation value={ventas.length} duration={1000} /></span>
              </div>
              <div className={estilos.pieTarjeta}>
                <span>Pendientes por despachar</span>
                <span className={estilos.subValorTarjeta}><CountUpAnimation value={ventas.filter((v) => v.estado === 'Pendiente').length} duration={1000} /></span>
              </div>
            </div>

            <div className={`${estilos.tarjetaMetrica} ${estilos.tarjetaColorida} ${estilos.bgNaranja}`}>
              <p className={estilos.encabezadoTarjeta}>Prendas en stock</p>
              <div className={estilos.centroTarjeta}>
                <span className={estilos.iconoTarjeta}><Package size={28} /></span>
                <span className={estilos.valorTarjeta}><CountUpAnimation value={totalProductosEnStock} duration={1000} /></span>
              </div>
              <div className={estilos.pieTarjeta}>
                <span>Referencias diferentes</span>
                <span className={estilos.subValorTarjeta}><CountUpAnimation value={productos.length} duration={1000} /></span>
              </div>
            </div>

            <div className={`${estilos.tarjetaMetrica} ${estilos.tarjetaColorida} ${estilos.bgRojo}`}>
              <p className={estilos.encabezadoTarjeta}>Stock bajo</p>
              <div className={estilos.centroTarjeta}>
                <span className={estilos.iconoTarjeta}><AlertTriangle size={28} /></span>
                <span className={estilos.valorTarjeta}><CountUpAnimation value={productosConStockBajo} duration={1000} /></span>
              </div>
              <div className={estilos.pieTarjeta}>
                <span>{productosConStockBajo > 0 ? `Unidades ≤ ${UMBRAL_STOCK_BAJO}` : 'Inventario sano'}</span>
                <span className={estilos.subValorTarjeta}><CountUpAnimation value={productosConStockBajo} duration={1000} /></span>
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
                {ventasPaginadas.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-texto-secundario)', padding: '24px' }}>
                      No hay ventas registradas aún.
                    </td>
                  </tr>
                ) : (
                  ventasPaginadas.map((venta) => (
                    <tr key={venta.id}>
                      <td>{venta.id}</td>
                      <td>{venta.productos}</td>
                      <td>{venta.fecha}</td>
                      <td>
                        {venta.moneda === 'USD' ? '$' : 'Bs '}
                        <CountUpAnimation value={venta.total} duration={800} decimals={2} />
                      </td>
                      <td>
                        <span className={venta.estado === 'Completada' ? estilos.badgeCompletada : estilos.badgePendiente}>
                          {venta.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className={estilos.paginacion}>
                <span className={estilos.infoPaginacion}>
                  Mostrando {indiceInicial + 1}-{Math.min(indiceFinal, ventas.length)} de {ventas.length}
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
        </>
      )}

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

            {/* Tasas en tiempo real */}
            {tasasActuales && (
              <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: 'rgba(119, 13, 238, 0.1)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primario)' }}>TASAS EN TIEMPO REAL</span>
                  <button
                    type="button"
                    onClick={cargarTasas}
                    disabled={cargandoTasas}
                    style={{ background: 'none', border: 'none', cursor: cargandoTasas ? 'not-allowed' : 'pointer', color: 'var(--color-primario)', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <RefreshCw size={14} className={cargandoTasas ? estilos.iconoGirando : ''} />
                    Actualizar
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '11px' }}>
                  <div>
                    <div style={{ color: 'var(--color-texto-secundario)', marginBottom: '2px' }}>Dólar BCV</div>
                    <div style={{ fontWeight: 600 }}>{tasasActuales.dolarBCV.toFixed(2)} Bs</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--color-texto-secundario)', marginBottom: '2px' }}>Euro BCV</div>
                    <div style={{ fontWeight: 600 }}>{tasasActuales.euroBCV.toFixed(2)} Bs</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--color-texto-secundario)', marginBottom: '2px' }}>USDT Promedio</div>
                    <div style={{ fontWeight: 600 }}>{tasasActuales.usdtPromedio.toFixed(2)} Bs</div>
                  </div>
                </div>
                <div style={{ fontSize: '10px', color: 'var(--color-texto-secundario)', marginTop: '6px' }}>
                  Actualizado: {new Date(tasasActuales.ultimaActualizacion).toLocaleTimeString('es-VE')}
                </div>
              </div>
            )}

            {/* Mensaje de error */}
            {errorTasas && !tasasActuales && (
              <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: 'rgba(179, 38, 30, 0.1)', borderRadius: '8px', border: '1px solid rgba(179, 38, 30, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <AlertTriangle size={16} style={{ color: 'var(--color-error)' }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-error)' }}>Error al cargar tasas</span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--color-texto-secundario)', margin: 0 }}>{errorTasas}</p>
                <button
                  type="button"
                  onClick={cargarTasas}
                  disabled={cargandoTasas}
                  style={{ marginTop: '8px', padding: '6px 12px', fontSize: '11px', backgroundColor: 'var(--color-error)', color: 'white', border: 'none', borderRadius: '4px', cursor: cargandoTasas ? 'not-allowed' : 'pointer' }}
                >
                  {cargandoTasas ? 'Intentando...' : 'Reintentar'}
                </button>
              </div>
            )}

            {cargandoTasas && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                <Loader2 size={24} className={estilos.iconoGirando} />
              </div>
            )}

            <div className={estilos.campoGrupo}>
              <label htmlFor="selector-tasa" className={estilos.labelCampo}>Fuente de la tasa</label>
              <select
                id="selector-tasa"
                className={estilos.selectorBase}
                value={tipoTasa}
                onChange={(e) => {
                  setTipoTasa(e.target.value);
                }}
                disabled={cargandoTasas}
              >
                <option value="dolar_bcv">Dólar BCV</option>
                <option value="euro_bcv">Euro BCV</option>
                <option value="promedio_usdt">Promedio USDT</option>
                <option value="personalizada">Personalizada</option>
              </select>
            </div>

            <div className={estilos.campoGrupo}>
              <label htmlFor="input-tasa" className={estilos.labelCampo}>
                Valor de la tasa {tipoTasa !== 'personalizada' && '(automático)'}
              </label>
              <input
                id="input-tasa"
                type="number"
                step="0.01"
                min="0"
                className={estilos.inputBase}
                placeholder="0.00"
                value={tasaPersonalizada}
                onChange={(e) => setTasaPersonalizada(e.target.value)}
                disabled={cargandoTasas}
                readOnly={tipoTasa !== 'personalizada'}
              />
            </div>

            <div className={estilos.accionesModal}>
              <button type="button" className={estilos.botonCancelar} onClick={() => setModalTasaAbierto(false)}>
                Cancelar
              </button>
              <button type="button" className={estilos.botonGuardar} onClick={aplicarTasa} disabled={cargandoTasas}>
                Aplicar tasa
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
