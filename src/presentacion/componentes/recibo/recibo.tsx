'use client';

import { useRef } from 'react';
import { X, Download } from 'lucide-react';
import iconoNegocio from '@/assets/icon dark.png';
import { formatearPrecio, TASA_CAMBIO } from '@/compartido/datos-demo';
import estilos from './recibo.module.css';

interface ItemRecibo {
  idVirtual: string;
  producto: {
    nombre: string;
    precio: number;
    moneda: 'USD' | 'VES';
  };
  talla: string;
  cantidad: number;
}

interface ReciboProps {
  items: ItemRecibo[];
  subtotal: number;
  total: number;
  fecha: string;
  alCerrar: () => void;
}

/**
 * Componente de recibo de venta con diseño premium.
 * Permite descargar el recibo como imagen PNG.
 */
export default function Recibo({ items, subtotal, total, fecha, alCerrar }: ReciboProps) {
  const reciboRef = useRef<HTMLDivElement>(null);

  /** Genera y descarga el recibo como imagen PNG usando html-to-image */
  const descargarImagen = async () => {
    if (!reciboRef.current) return;

    const nodo = reciboRef.current;
    const { toPng } = await import('html-to-image');
    
    const dataUrl = await toPng(nodo, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      width: nodo.scrollWidth,
      height: nodo.scrollHeight,
      style: {
        transform: 'none',
      }
    });

    const enlace = document.createElement('a');
    enlace.download = `recibo-julimoda-${Date.now()}.png`;
    enlace.href = dataUrl;
    enlace.click();
  };

  const totalVES = total * TASA_CAMBIO;

  return (
    <div className={estilos.overlay}>
      <div className={estilos.contenedor} role="dialog" aria-modal="true" aria-labelledby="titulo-recibo">
        {/* Botones de acción (fuera del área a capturar) */}
        <div className={estilos.acciones}>
          <button
            type="button"
            className={estilos.botonDescargar}
            onClick={descargarImagen}
            aria-label="Descargar recibo como imagen"
          >
            <Download size={16} />
            Descargar
          </button>
          <button
            type="button"
            className={estilos.botonCerrar}
            onClick={alCerrar}
            aria-label="Cerrar recibo"
          >
            <X size={20} />
          </button>
        </div>

        {/* Área del recibo (la que se captura como imagen) */}
        <div ref={reciboRef} className={estilos.ticket}>
          {/* Cabecera */}
          <div className={estilos.cabecera}>
            <div className={estilos.logoContenedor}>
              <img
                src={iconoNegocio.src}
                alt="JuliModa"
                className={estilos.logoImagen}
              />
            </div>
            <h1 className={estilos.marca}>JuliModa</h1>
            <p className={estilos.slogan}>Tu moda, tu estilo</p>
          </div>

          {/* Info de la venta */}
          <div className={estilos.infoVenta}>
            <div className={estilos.filaDato}>
              <span className={estilos.etiqueta}>Fecha</span>
              <span className={estilos.valor}>{fecha}</span>
            </div>
            <div className={estilos.filaDato}>
              <span className={estilos.etiqueta}>Atendido por</span>
              <span className={estilos.valor}>Administrador</span>
            </div>
          </div>

          {/* Divisor */}
          <div className={estilos.divisorPunteado} />

          {/* Lista de productos */}
          <div className={estilos.listaProductos}>
            <div className={estilos.encabezadoTabla}>
              <span>Producto</span>
              <span>Total</span>
            </div>
            {items.map((item) => {
              const precioUSD = item.producto.moneda === 'VES'
                ? item.producto.precio / TASA_CAMBIO
                : item.producto.precio;
              const totalLinea = precioUSD * item.cantidad;
              return (
                <div key={item.idVirtual} className={estilos.lineaProducto}>
                  <div className={estilos.detalleProducto}>
                    <span className={estilos.nombreProducto}>{item.producto.nombre}</span>
                    <span className={estilos.metaProducto}>
                      Talla {item.talla} · {item.cantidad} × {formatearPrecio(precioUSD, 'USD')} ({formatearPrecio(precioUSD * TASA_CAMBIO, 'VES')})
                    </span>
                  </div>
                  <div className={estilos.preciosLinea}>
                    <span className={estilos.totalLinea}>{formatearPrecio(totalLinea, 'USD')}</span>
                    <span className={estilos.totalLineaVES}>{formatearPrecio(totalLinea * TASA_CAMBIO, 'VES')}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Divisor */}
          <div className={estilos.divisorPunteado} />

          {/* Totales */}
          <div className={estilos.totales}>
            <div className={estilos.filaTotalSec}>
              <span>Subtotal USD</span>
              <span>{formatearPrecio(subtotal, 'USD')}</span>
            </div>
            <div className={estilos.filaTotalSec}>
              <span>Subtotal Bs.</span>
              <span>{formatearPrecio(subtotal * TASA_CAMBIO, 'VES')}</span>
            </div>
            <div className={estilos.divisorSolido} />
            <div className={estilos.filaTotal}>
              <span>Total USD</span>
              <span>{formatearPrecio(total, 'USD')}</span>
            </div>
            <div className={estilos.filaTotal}>
              <span>Total Bs.</span>
              <span>{formatearPrecio(totalVES, 'VES')}</span>
            </div>
          </div>

          {/* Pie del recibo */}
          <div className={estilos.pie}>
            <p>¡Gracias por tu compra!</p>
            <p className={estilos.subPie}>Este recibo es tu comprobante de pago</p>
          </div>
        </div>
      </div>
    </div>
  );
}
