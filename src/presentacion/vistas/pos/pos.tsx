'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CATEGORIAS,
  formatearPrecio,
  TASA_CAMBIO,
  type Producto,
  type CategoriaProducto,
} from '@/compartido/datos-demo';
import { AdaptadorProductos } from '@/infraestructura/api/adaptador-productos';
import { AdaptadorVentas } from '@/infraestructura/api/adaptador-ventas';
import { ObtenerProductos } from '@/aplicacion/casos-uso/obtener-productos';
import { RegistrarVenta } from '@/aplicacion/casos-uso/registrar-venta';
import { ActualizarStock } from '@/aplicacion/casos-uso/actualizar-stock';
import { Image as ImageIcon, X, Loader2 } from 'lucide-react';
import Recibo from '@/presentacion/componentes/recibo/recibo';
import estilos from './pos.module.css';

const casoProductos = new ObtenerProductos(new AdaptadorProductos());
const casoRegistrar = new RegistrarVenta(new AdaptadorVentas());
const casoActualizarStock = new ActualizarStock(new AdaptadorProductos());

interface ItemCarrito {
  idVirtual: string;
  producto: Producto;
  talla: string;
  cantidad: number;
}

/**
 * Módulo de Punto de Venta (POS) de JuliModa.
 *
 * Panel izquierdo: catálogo de productos con búsqueda y filtro.
 * Panel derecho: carrito de compra con subtotal, descuento y total.
 * Al confirmar la venta, el carrito se limpia.
 */
export default function Pos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<CategoriaProducto | ''>('');
  const [toastVisible, setToastVisible] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [tasaCambio, setTasaCambio] = useState(TASA_CAMBIO);
  const [reciboData, setReciboData] = useState<{
    items: ItemCarrito[];
    subtotal: number;
    total: number;
    fecha: string;
  } | null>(null);

  // Carga de catálogo desde Supabase
  const cargarProductos = useCallback(async () => {
    setCargando(true);
    try {
      const datos = await casoProductos.ejecutar();
      setProductos(datos);
    } catch {
      // Si falla, catálogo vacío
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  // Cargar la tasa de cambio desde localStorage si está disponible
  useEffect(() => {
    const tasaGuardada = localStorage.getItem('tasaCambio');
    if (tasaGuardada) {
      setTasaCambio(parseFloat(tasaGuardada));
    }
  }, []);

  /* Productos filtrados para el catálogo */
  const productosFiltrados = productos.filter((p) => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaFiltro === '' || p.categoria === categoriaFiltro;
    return coincideBusqueda && coincideCategoria && p.stock > 0;
  });

  /** Agrega un producto al carrito o incrementa su cantidad */
  const agregarAlCarrito = (producto: Producto, talla: string) => {
    const idVirtual = `${producto.id}-${talla}`;
    setCarrito((prev) => {
      const existente = prev.find((item) => item.idVirtual === idVirtual);
      if (existente) {
        return prev.map((item) =>
          item.idVirtual === idVirtual
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { idVirtual, producto, talla, cantidad: 1 }];
    });
  };

  /** Incrementa la cantidad de un ítem del carrito */
  const incrementar = (idVirtual: string) => {
    setCarrito((prev) =>
      prev.map((item) =>
        item.idVirtual === idVirtual
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      )
    );
  };

  /** Decrementa la cantidad o elimina el ítem si llega a 0 */
  const decrementar = (idVirtual: string) => {
    setCarrito((prev) =>
      prev
        .map((item) =>
          item.idVirtual === idVirtual
            ? { ...item, cantidad: item.cantidad - 1 }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const manejarClickProducto = (producto: Producto) => {
    if (producto.tallas.length <= 1) {
      const talla = producto.tallas.length === 1 ? producto.tallas[0].nombre : 'Única';
      agregarAlCarrito(producto, talla);
    } else {
      setProductoSeleccionado(producto);
    }
  };

  /* Cálculos del resumen */
  const subtotal = carrito.reduce(
    (suma, item) => {
      const precioUnificado = item.producto.moneda === 'VES' ? item.producto.precio / tasaCambio : item.producto.precio;
      return suma + precioUnificado * item.cantidad;
    },
    0
  );
  const total = subtotal;
  const cantidadItems = carrito.reduce((suma, item) => suma + item.cantidad, 0);

  /** Confirma la venta, la persiste en Supabase y limpia el carrito */
  const confirmarVenta = async () => {
    const descripcionProductos = carrito
      .map(item => `${item.producto.nombre} x${item.cantidad}`)
      .join(', ');

    try {
      // Actualizar stock de cada producto vendido
      for (const item of carrito) {
        await casoActualizarStock.ejecutar(item.producto.id, item.talla, item.cantidad);
      }

      // Registrar la venta
      await casoRegistrar.ejecutar({
        productos: descripcionProductos,
        total,
        moneda: 'USD',
        estado: 'Completada',
        fecha: new Date().toISOString(),
      });

      // Recargar productos para mostrar stock actualizado
      await cargarProductos();
    } catch (error) {
      console.error('Error al procesar la venta:', error);
      // Si falla, no bloqueamos al usuario pero mostramos error
      return;
    }

    setReciboData({
      items: [...carrito],
      subtotal,
      total,
      fecha: new Date().toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' })
    });
    setCarrito([]);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  return (
    <main className={estilos.pagina}>
      {/* Panel izquierdo: catálogo */}
      <section className={estilos.catalogo} aria-label="Catálogo de productos">
        <div className={estilos.encabezadoCatalogo}>
          <h1 className={estilos.tituloCatalogo}>Punto de venta</h1>
        </div>

        <div className={estilos.cuerpoCatalogo}>
          {/* Filtros */}
        <div className={estilos.filtros}>
          <input
            className={estilos.campoBusqueda}
            type="search"
            placeholder="Buscar producto…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar producto por nombre"
          />
          <select
            className={estilos.selectCategoria}
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value as CategoriaProducto | '')}
            aria-label="Filtrar por categoría"
          >
            <option value="">Todas</option>
            {CATEGORIAS.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Grilla de productos */}
        <div className={estilos.gridProductos}>
          {productosFiltrados.map((producto) => {
            const precioUSD = producto.moneda === 'USD' ? producto.precio : producto.precio / tasaCambio;
            const precioVES = producto.moneda === 'VES' ? producto.precio : producto.precio * tasaCambio;

            return (
              <button
                key={producto.id}
                className={estilos.tarjetaProducto}
                onClick={() => manejarClickProducto(producto)}
                aria-label={`Seleccionar ${producto.nombre}`}
              >
                <div className={estilos.imagenProductoContenedor}>
                  {producto.foto ? (
                    <img src={producto.foto} alt={producto.nombre} className={estilos.imagenProducto} />
                  ) : (
                    <div className={estilos.imagenPlaceholder}>
                      <ImageIcon size={32} className={estilos.iconoPlaceholder} />
                    </div>
                  )}
                </div>
                <div className={estilos.infoProducto}>
                  <p className={estilos.nombreProducto}>{producto.nombre}</p>
                  <p className={estilos.metaProducto}>
                    Tallas: {producto.tallas.length > 0 ? producto.tallas.map(t => t.nombre).join(', ') : 'Única'}
                  </p>
                  <div className={estilos.preciosProducto}>
                    <p className={estilos.precioPrincipal}>
                      {formatearPrecio(precioUSD, 'USD')}
                    </p>
                    <p className={estilos.precioSecundario}>
                      {formatearPrecio(precioVES, 'VES')}
                    </p>
                  </div>
                  <p className={estilos.stockProducto}>Stock: {producto.stock}</p>
                </div>
              </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Panel derecho: carrito */}
      <aside className={estilos.carrito} aria-label="Carrito de compra">
        <div className={estilos.encabezadoCarrito}>
          <h2 className={estilos.tituloCarrito}>
            Carrito {cantidadItems > 0 ? `(${cantidadItems})` : ''}
          </h2>
        </div>

        {/* Ítems del carrito */}
        <div className={estilos.listaCarrito}>
          {carrito.length === 0 && (
            <p className={estilos.vacio}>
              Selecciona productos del catálogo para agregarlos aquí.
            </p>
          )}
          {carrito.map((item) => (
            <div key={item.idVirtual} className={estilos.itemCarrito}>
              <div className={estilos.infoItemCarrito}>
                <p className={estilos.nombreItemCarrito}>{item.producto.nombre}</p>
                <p className={estilos.metaItemCarrito}>Talla: {item.talla}</p>
                <div className={estilos.preciosItemCarrito}>
                  <span className={estilos.precioDolares}>
                    {formatearPrecio(item.producto.moneda === 'USD' ? item.producto.precio : item.producto.precio / tasaCambio, 'USD')} c/u
                  </span>
                  <span className={estilos.precioBolivares}>
                    {formatearPrecio(item.producto.moneda === 'VES' ? item.producto.precio : item.producto.precio * tasaCambio, 'VES')} c/u
                  </span>
                </div>
              </div>
              <div className={estilos.controlesItem}>
                <button
                  className={estilos.botonCantidad}
                  onClick={() => decrementar(item.idVirtual)}
                  aria-label={`Quitar una unidad de ${item.producto.nombre}`}
                >
                  −
                </button>
                <span className={estilos.cantidadItem}>{item.cantidad}</span>
                <button
                  className={estilos.botonCantidad}
                  onClick={() => incrementar(item.idVirtual)}
                  aria-label={`Agregar una unidad más de ${item.producto.nombre}`}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen de precios */}
        <div className={estilos.resumen}>
          <div className={estilos.filaResumen}>
            <span>Subtotal (USD)</span>
            <span>{formatearPrecio(subtotal, 'USD')}</span>
          </div>
          <div className={estilos.filaResumen}>
            <span>Subtotal (Bs.)</span>
            <span>{formatearPrecio(subtotal * tasaCambio, 'VES')}</span>
          </div>
          <div className={estilos.filaTotal}>
            <span>Total USD</span>
            <span>{formatearPrecio(total, 'USD')}</span>
          </div>
          <div className={estilos.filaTotalSecundario}>
            <span>Total Bs.</span>
            <strong>{formatearPrecio(total * tasaCambio, 'VES')}</strong>
          </div>
        </div>

        {/* Acciones */}
        <div className={estilos.accionesCarrito}>
          <button
            className={estilos.botonConfirmar}
            onClick={confirmarVenta}
            disabled={carrito.length === 0}
          >
            Confirmar venta
          </button>
          {carrito.length > 0 && (
            <button
              className={estilos.botonLimpiar}
              onClick={() => { setCarrito([]); }}
            >
              Limpiar carrito
            </button>
          )}
        </div>
      </aside>

      {/* Modal Selección de Talla */}
      {productoSeleccionado && (
        <div className={estilos.overlayModal}>
          <div className={estilos.modal} role="dialog" aria-modal="true" aria-labelledby="titulo-modal-talla">
            <div className={estilos.encabezadoModal}>
              <h2 id="titulo-modal-talla" className={estilos.tituloModal}>Seleccionar Talla</h2>
              <button 
                type="button" 
                className={estilos.botonCerrar} 
                onClick={() => setProductoSeleccionado(null)}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className={estilos.textoModalInfo}>{productoSeleccionado.nombre}</p>

            <div className={estilos.gridTallas}>
              {productoSeleccionado.tallas.map(t => (
                <button 
                  key={t.nombre}
                  className={estilos.botonTalla}
                  onClick={() => {
                    agregarAlCarrito(productoSeleccionado, t.nombre);
                    setProductoSeleccionado(null);
                  }}
                  disabled={t.cantidad <= 0}
                >
                  <span className={estilos.nombreTalla}>{t.nombre}</span>
                  <span className={estilos.stockTalla}>{t.cantidad} disp.</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recibo de venta con descarga como imagen */}
      {reciboData && (
        <Recibo
          items={reciboData.items}
          subtotal={reciboData.subtotal}
          total={reciboData.total}
          fecha={reciboData.fecha}
          tasaCambio={tasaCambio}
          alCerrar={() => setReciboData(null)}
        />
      )}

      {/* Toast de confirmación */}
      {toastVisible && (
        <div className={estilos.toast} role="status" aria-live="polite">
          ✓ Venta registrada correctamente
        </div>
      )}
    </main>
  );
}
