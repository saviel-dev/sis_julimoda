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
import estilos from './pos.module.css';

interface ItemCarrito {
  producto: Producto;
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
  const [descuento, setDescuento] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);

  /* Productos filtrados para el catálogo */
  const productosFiltrados = PRODUCTOS_DEMO.filter((p) => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaFiltro === '' || p.categoria === categoriaFiltro;
    return coincideBusqueda && coincideCategoria && p.stock > 0;
  });

  /** Agrega un producto al carrito o incrementa su cantidad */
  const agregarAlCarrito = (producto: Producto) => {
    setCarrito((prev) => {
      const existente = prev.find((item) => item.producto.id === producto.id);
      if (existente) {
        return prev.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { producto, cantidad: 1 }];
    });
  };

  /** Incrementa la cantidad de un ítem del carrito */
  const incrementar = (id: string) => {
    setCarrito((prev) =>
      prev.map((item) =>
        item.producto.id === id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      )
    );
  };

  /** Decrementa la cantidad o elimina el ítem si llega a 0 */
  const decrementar = (id: string) => {
    setCarrito((prev) =>
      prev
        .map((item) =>
          item.producto.id === id
            ? { ...item, cantidad: item.cantidad - 1 }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  /* Cálculos del resumen */
  const subtotal = carrito.reduce(
    (suma, item) => {
      const precioUnificado = item.producto.moneda === 'VES' ? item.producto.precio / TASA_CAMBIO : item.producto.precio;
      return suma + precioUnificado * item.cantidad;
    },
    0
  );
  const valorDescuento = Math.min(descuento, subtotal);
  const total = subtotal - valorDescuento;
  const cantidadItems = carrito.reduce((suma, item) => suma + item.cantidad, 0);

  /** Confirma la venta y limpia el carrito */
  const confirmarVenta = () => {
    setCarrito([]);
    setDescuento(0);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  return (
    <div className={estilos.pagina}>
      {/* Panel izquierdo: catálogo */}
      <section className={estilos.catalogo} aria-label="Catálogo de productos">
        <h1 className={estilos.tituloCatalogo}>Punto de venta</h1>

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
          {productosFiltrados.map((producto) => (
            <button
              key={producto.id}
              className={estilos.tarjetaProducto}
              onClick={() => agregarAlCarrito(producto)}
              aria-label={`Agregar ${producto.nombre} al carrito`}
            >
              <p className={estilos.nombreProducto}>{producto.nombre}</p>
              <p className={estilos.metaProducto}>
                Tallas: {producto.tallas.length > 0 ? producto.tallas.map(t => t.nombre).join(', ') : 'Única'}
              </p>
              <p className={estilos.precioProducto}>{formatearPrecio(producto.precio, producto.moneda)}</p>
              <p className={estilos.stockProducto}>Stock: {producto.stock}</p>
            </button>
          ))}
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
            <div key={item.producto.id} className={estilos.itemCarrito}>
              <div className={estilos.infoItemCarrito}>
                <p className={estilos.nombreItemCarrito}>{item.producto.nombre}</p>
                <p className={estilos.precioItemCarrito}>
                  {formatearPrecio(item.producto.precio, item.producto.moneda)} c/u
                </p>
              </div>
              <div className={estilos.controlesItem}>
                <button
                  className={estilos.botonCantidad}
                  onClick={() => decrementar(item.producto.id)}
                  aria-label={`Quitar una unidad de ${item.producto.nombre}`}
                >
                  −
                </button>
                <span className={estilos.cantidadItem}>{item.cantidad}</span>
                <button
                  className={estilos.botonCantidad}
                  onClick={() => incrementar(item.producto.id)}
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
            <span>Subtotal</span>
            <span>{formatearPrecio(subtotal, 'USD')}</span>
          </div>
          <div className={estilos.filaResumen}>
            <label htmlFor="campo-descuento">Descuento (USD)</label>
            <input
              id="campo-descuento"
              className={estilos.campoDescuento}
              type="number"
              min={0}
              max={subtotal}
              value={descuento}
              onChange={(e) => setDescuento(Math.max(0, Number(e.target.value)))}
            />
          </div>
          <div className={estilos.filaTotal}>
            <span>Total</span>
            <strong>{formatearPrecio(total, 'USD')}</strong>
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
              onClick={() => { setCarrito([]); setDescuento(0); }}
            >
              Limpiar carrito
            </button>
          )}
        </div>
      </aside>

      {/* Toast de confirmación */}
      {toastVisible && (
        <div className={estilos.toast} role="status" aria-live="polite">
          ✓ Venta registrada correctamente
        </div>
      )}
    </div>
  );
}
