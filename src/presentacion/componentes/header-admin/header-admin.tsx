'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  Search, 
  Activity, 
  Settings, 
  ChevronDown,
  ChevronLeft,
  Package,
  ShoppingCart,
  LayoutDashboard,
  PieChart,
  SlidersHorizontal,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';
import Image from 'next/image';
import { PRODUCTOS_DEMO, VENTAS_RECIENTES_DEMO } from '@/compartido/datos-demo';
import { sesionLocal } from '@/infraestructura/almacenamiento/sesion-local';
import estilos from './header-admin.module.css';

interface PropsHeaderAdmin {
  minimizada?: boolean;
  onToggleMinimizar?: () => void;
}

type ResultadoBusqueda = {
  id: string;
  titulo: string;
  detalle: string;
  href: string;
  icono: React.ReactNode;
};

const SECCIONES_BUSQUEDA: ResultadoBusqueda[] = [
  { id: 'dashboard', titulo: 'Dashboard', detalle: 'Resumen del negocio', href: '/admin/dashboard', icono: <LayoutDashboard size={20} /> },
  { id: 'inventario', titulo: 'Inventario', detalle: 'Productos y existencias', href: '/admin/inventario', icono: <Package size={20} /> },
  { id: 'pos', titulo: 'Punto de venta', detalle: 'Registrar una venta', href: '/admin/pos', icono: <ShoppingCart size={20} /> },
  { id: 'reportes', titulo: 'Reportes', detalle: 'Informes del negocio', href: '/admin/reportes', icono: <PieChart size={20} /> },
  { id: 'ajustes', titulo: 'Ajustes', detalle: 'Configuración del sistema', href: '/admin/ajustes', icono: <SlidersHorizontal size={20} /> },
];

const normalizar = (texto: string) => texto.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/**
 * Header superior del panel administrativo.
 *
 * Contiene el título de la página actual, buscador global, iconos
 * de acción rápida y el perfil del usuario activo.
 */
export default function HeaderAdmin({ minimizada, onToggleMinimizar }: PropsHeaderAdmin) {
  const rutaActual = usePathname();
  const router = useRouter();
  const [busqueda, setBusqueda] = useState('');
  const [menuPerfilAbierto, setMenuPerfilAbierto] = useState(false);
  const [temaOscuro, setTemaOscuro] = useState(false);

  useEffect(() => {
    const temaGuardado = localStorage.getItem('julimoda-tema');
    if (temaGuardado === 'oscuro') {
      setTemaOscuro(true);
      document.documentElement.classList.add('tema-oscuro');
    }
  }, []);

  const toggleTema = () => {
    if (temaOscuro) {
      document.documentElement.classList.remove('tema-oscuro');
      localStorage.setItem('julimoda-tema', 'claro');
      setTemaOscuro(false);
    } else {
      document.documentElement.classList.add('tema-oscuro');
      localStorage.setItem('julimoda-tema', 'oscuro');
      setTemaOscuro(true);
    }
  };
  
  const cerrarSesion = () => {
    sesionLocal.eliminar();
    router.push('/');
  };

  // Extraer el nombre de la página de la ruta para el título
  const segmentos = rutaActual.split('/').filter(Boolean);
  const tituloPagina = segmentos.length > 1 ? segmentos[segmentos.length - 1] : 'Dashboard';
  const termino = normalizar(busqueda.trim());
  const resultados: ResultadoBusqueda[] = termino ? [
    ...SECCIONES_BUSQUEDA.filter((seccion) =>
      normalizar(`${seccion.titulo} ${seccion.detalle}`).includes(termino)
    ),
    ...PRODUCTOS_DEMO.filter((producto) =>
      normalizar(`${producto.nombre} ${producto.id} ${producto.categoria} ${producto.descripcion ?? ''}`).includes(termino)
    ).map((producto) => ({
      id: `producto-${producto.id}`,
      titulo: producto.nombre,
      detalle: `${producto.categoria} · ID ${producto.id}`,
      href: '/admin/inventario',
      icono: <Package size={20} />,
    })),
    ...VENTAS_RECIENTES_DEMO.filter((venta) =>
      normalizar(`${venta.id} ${venta.productos} ${venta.estado}`).includes(termino)
    ).map((venta) => ({
      id: `venta-${venta.id}`,
      titulo: `Venta ${venta.id}`,
      detalle: `${venta.productos} · ${venta.estado}`,
      href: '/admin/dashboard',
      icono: <ShoppingCart size={20} />,
    })),
  ].slice(0, 7) : [];

  const abrirResultado = (resultado: ResultadoBusqueda) => {
    setBusqueda('');
    router.push(resultado.href);
  };

  return (
    <header className={estilos.header}>
      {/* Título de la página */}
      <div className={estilos.ladoIzquierdo}>
        <button 
          className={estilos.botonVolver} 
          aria-label={minimizada ? "Expandir menú" : "Minimizar menú"}
          onClick={onToggleMinimizar}
        >
          <ChevronLeft 
            size={18} 
            style={{ 
              transform: minimizada ? 'rotate(180deg)' : 'none', 
              transition: 'transform 0.2s' 
            }} 
          />
        </button>
        <h1 className={estilos.titulo}>
          {tituloPagina.replace('-', ' ')}
        </h1>
      </div>

      {/* Buscador global */}
      <div className={estilos.centro}>
        <div className={estilos.buscadorContenedor}>
          <Search size={18} className={estilos.iconoBuscar} />
          <input 
            type="text" 
            placeholder="Buscar en el sistema..." 
            className={estilos.inputBuscador}
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            onKeyDown={(evento) => {
              if (evento.key === 'Enter' && resultados[0]) abrirResultado(resultados[0]);
              if (evento.key === 'Escape') setBusqueda('');
            }}
            aria-label="Buscar en el sistema"
            aria-expanded={resultados.length > 0}
          />
          {resultados.length > 0 && (
            <div className={estilos.resultadosBusqueda} role="listbox" aria-label="Resultados de búsqueda">
              {resultados.map((resultado) => (
                <button
                  key={resultado.id}
                  type="button"
                  className={estilos.resultadoBusqueda}
                  onMouseDown={(evento) => evento.preventDefault()}
                  onClick={() => abrirResultado(resultado)}
                  role="option"
                >
                  <span className={estilos.iconoResultado}>{resultado.icono}</span>
                  <span className={estilos.textoResultado}>
                    <strong>{resultado.titulo}</strong>
                    <small>{resultado.detalle}</small>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Acciones y Perfil */}
      <div className={estilos.ladoDerecho}>
        <div className={estilos.acciones}>
          <button 
            onClick={toggleTema}
            className={`${estilos.botonAccion} ${estilos.botonTema}`}
            aria-label="Alternar tema"
            data-tooltip={temaOscuro ? "Tema claro" : "Tema oscuro"}
          >
            <div className={`${estilos.iconoTema} ${temaOscuro ? estilos.animacionGirar : estilos.animacionGirarReverse}`}>
              {temaOscuro ? <Moon size={20} /> : <Sun size={20} />}
            </div>
          </button>
          <Link 
            href="/admin/reportes" 
            className={estilos.botonAccion} 
            aria-label="Reportes"
            data-tooltip="Reportes"
          >
            <Activity size={20} />
          </Link>
          <Link 
            href="/admin/ajustes" 
            className={estilos.botonAccion} 
            aria-label="Ajustes"
            data-tooltip="Ajustes"
          >
            <Settings size={20} />
            <span className={estilos.indicadorNotificacion}></span>
          </Link>
        </div>

        <div className={estilos.perfilContenedor}>
          <button 
            className={estilos.perfil}
            onClick={() => setMenuPerfilAbierto(!menuPerfilAbierto)}
            aria-expanded={menuPerfilAbierto}
            aria-haspopup="true"
          >
            <div className={estilos.infoPerfil}>
              <span className={estilos.nombrePerfil}>Julieta Romero</span>
              <span className={estilos.rolPerfil}>He realizado 124 ventas</span>
            </div>
            <Image 
              src="/logo.svg" 
              alt="Avatar" 
              width={36} 
              height={36} 
              className={estilos.avatar}
            />
            <ChevronDown size={16} className={estilos.iconoDesplegable} />
          </button>

          {menuPerfilAbierto && (
            <div className={estilos.menuPerfil}>
              <button 
                className={estilos.itemMenuPerfil} 
                onClick={cerrarSesion}
              >
                <LogOut size={18} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
