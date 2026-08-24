'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  PieChart,
  Settings,
  Headset,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { sesionLocal } from '@/infraestructura/almacenamiento/sesion-local';
import estilos from './sidebar.module.css';

/** Tamaño de los íconos de navegación */
const TAMANO_ICONO = 18;

interface ItemNavegacion {
  href: string;
  etiqueta: string;
  icono: React.ReactNode;
}

interface SeccionNavegacion {
  titulo: string;
  items: ItemNavegacion[];
}

const NAVEGACION: SeccionNavegacion[] = [
  {
    titulo: 'PRINCIPAL',
    items: [
      {
        href: '/admin/dashboard',
        etiqueta: 'Dashboard',
        icono: <LayoutDashboard size={TAMANO_ICONO} />,
      }
    ]
  },
  {
    titulo: 'GESTIÓN',
    items: [
      {
        href: '/admin/inventario',
        etiqueta: 'Inventario',
        icono: <Package size={TAMANO_ICONO} />,
      },
      {
        href: '/admin/pos',
        etiqueta: 'Punto de venta',
        icono: <ShoppingCart size={TAMANO_ICONO} />,
      },
    ]
  },
  {
    titulo: 'SISTEMA',
    items: [
      {
        href: '/admin/reportes',
        etiqueta: 'Reportes',
        icono: <PieChart size={TAMANO_ICONO} />,
      },
      {
        href: '/admin/ajustes',
        etiqueta: 'Ajustes',
        icono: <Settings size={TAMANO_ICONO} />,
      },
    ]
  }
];

/**
 * Sidebar de navegación lateral del sistema administrativo.
 */
export default function Sidebar() {
  const rutaActual = usePathname();
  const router = useRouter();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const cerrarSesion = () => {
    sesionLocal.eliminar();
    router.push('/');
  };

  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <>
      {/* Botón hamburguesa en móvil */}
      <button
        className={estilos.botonMenu}
        onClick={() => setMenuAbierto(true)}
        aria-label="Abrir menú de navegación"
        aria-expanded={menuAbierto}
      >
        <Menu size={20} />
      </button>

      {/* Overlay en móvil */}
      <div
        className={`${estilos.overlay} ${menuAbierto ? estilos.overlayVisible : ''}`}
        onClick={cerrarMenu}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <nav
        className={`${estilos.sidebar} ${menuAbierto ? estilos.sidebarAbierto : ''}`}
        aria-label="Navegación principal"
      >
        {/* Encabezado / Tienda */}
        <div className={estilos.bloqueTienda}>
          <Image
            src="/logo.svg"
            alt="Logo"
            width={32}
            height={32}
            className={estilos.logoTienda}
            priority
          />
          <div className={estilos.infoTienda}>
            <span className={estilos.nombreTienda}>JuliModa</span>
            <span className={estilos.direccionTienda}>Sede Central</span>
          </div>

          {/* Botón cerrar en móvil */}
          <button
            className={estilos.botonMenu}
            style={{ display: menuAbierto ? 'flex' : 'none', marginLeft: 'auto', position: 'static' }}
            onClick={cerrarMenu}
            aria-label="Cerrar menú de navegación"
          >
            <X size={16} />
          </button>
        </div>

        {/* Ítems de navegación categorizados */}
        <div className={estilos.nav}>
          {NAVEGACION.map((seccion) => (
            <div key={seccion.titulo} className={estilos.seccionNav}>
              {seccion.titulo && (
                <span className={estilos.seccionTitulo}>{seccion.titulo}</span>
              )}
              {seccion.items.map((item) => {
                const estaActivo = rutaActual.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${estilos.itemNav} ${estaActivo ? estilos.itemNavActivo : ''}`}
                    onClick={cerrarMenu}
                    aria-current={estaActivo ? 'page' : undefined}
                  >
                    <span className={estilos.iconoNav}>{item.icono}</span>
                    <span className={estilos.textoNav}>{item.etiqueta}</span>
                  </Link>
                );
              })}
            </div>
          ))}
          
          <div className={estilos.seccionNav} style={{ marginTop: 'var(--espacio-16)' }}>
             <button className={estilos.itemNav}>
                <span className={estilos.iconoNav}><Headset size={TAMANO_ICONO} /></span>
                <span className={estilos.textoNav}>Soporte técnico</span>
             </button>
          </div>
        </div>

        {/* Cerrar sesión */}
        <div className={estilos.pie}>
          <button
            className={estilos.botonCerrarSesion}
            onClick={cerrarSesion}
          >
            <span className={estilos.iconoNav}>
              <LogOut size={TAMANO_ICONO} />
            </span>
            <span className={estilos.textoNav}>Cerrar sesión</span>
          </button>
        </div>
      </nav>
    </>
  );
}
