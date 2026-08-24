'use client';

import { useState } from 'react';
import {
  PRODUCTOS_DEMO,
  CATEGORIAS,
  formatearPrecio,
  TASA_CAMBIO,
  type Producto,
  type CategoriaProducto,
} from '@/compartido/datos-demo';
import { Image as ImageIcon, X } from 'lucide-react';
import Recibo from '@/presentacion/componentes/recibo/recibo';
import estilos from './pos.module.css';

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
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<CategoriaProducto | ''>('');
  const [toastVisible, setToastVisible] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [reciboData, setReciboData] = useState<{
    items: ItemCarrito[];
    subtotal: number;
    total: number;
    fecha: string;
  } | null>(null);

  /* Productos filtrados para el catálogo */
  const productosFiltrados = PRODUCTOS_DEMO.filter((p) => {
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
      const precioUnificado = item.producto.moneda === 'VES' ? item.producto.precio / TASA_CAMBIO : item.producto.precio;
      return suma + precioUnificado * item.cantidad;
    },
    0
  );
  const total = subtotal;
  const cantidadItems = carrito.reduce((suma, item) => suma + item.cantidad, 0);

  /** Confirma la venta y limpia el carrito */
  const confirmarVenta = () => {
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
    <div className={estilos.pagina}>
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
            const precioUSD = producto.moneda === 'USD' ? producto.precio : producto.precio / TASA_CAMBIO;
            const precioVES = producto.moneda === 'VES' ? producto.precio : producto.precio * TASA_CAMBIO;

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
                    {formatearPrecio(item.producto.moneda === 'USD' ? item.producto.precio : item.producto.precio / TASA_CAMBIO, 'USD')} c/u
                  </span>
                  <span className={estilos.precioBolivares}>
                    {formatearPrecio(item.producto.moneda === 'VES' ? item.producto.precio : item.producto.precio * TASA_CAMBIO, 'VES')} c/u
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
            <span>{formatearPrecio(subtotal * TASA_CAMBIO, 'VES')}</span>
          </div>
          <div className={estilos.filaTotal}>
            <span>Total USD</span>
            <strong>{formatearPrecio(total, 'USD')}</strong>
          </div>
          <div className={estilos.filaTotalSecundario}>
            <span>Total Bs.</span>
            <strong>{formatearPrecio(total * TASA_CAMBIO, 'VES')}</strong>
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
          alCerrar={() => setReciboData(null)}
        />
      )}

      {/* Toast de confirmación */}
      {toastVisible && (
        <div className={estilos.toast} role="status" aria-live="polite">
          ✓ Venta registrada correctamente
        </div>
      )}
    </div>
  );
}
