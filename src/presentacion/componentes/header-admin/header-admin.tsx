'use client';

import { usePathname } from 'next/navigation';
import { 
  Search, 
  Plus, 
  HelpCircle, 
  Activity, 
  Settings, 
  ChevronDown,
  ChevronLeft
} from 'lucide-react';
import Image from 'next/image';
import estilos from './header-admin.module.css';

/**
 * Header superior del panel administrativo.
 *
 * Contiene el título de la página actual, buscador global, iconos
 * de acción rápida y el perfil del usuario activo.
 */
export default function HeaderAdmin() {
  const rutaActual = usePathname();
  
  // Extraer el nombre de la página de la ruta para el título
  const segmentos = rutaActual.split('/').filter(Boolean);
  const tituloPagina = segmentos.length > 1 ? segmentos[segmentos.length - 1] : 'Dashboard';

  return (
    <header className={estilos.header}>
      {/* Título de la página */}
      <div className={estilos.ladoIzquierdo}>
        <button className={estilos.botonVolver} aria-label="Volver atrás">
          <ChevronLeft size={18} />
        </button>
        <h1 className={estilos.titulo}>
          {tituloPagina.replace('-', ' ')}
        </h1>
      </div>

      {/* Buscador Global (Visual) */}
      <div className={estilos.centro}>
        <div className={estilos.buscadorContenedor}>
          <Search size={18} className={estilos.iconoBuscar} />
          <input 
            type="text" 
            placeholder="Buscar en el sistema..." 
            className={estilos.inputBuscador}
          />
        </div>
      </div>

      {/* Acciones y Perfil */}
      <div className={estilos.ladoDerecho}>
        <div className={estilos.acciones}>
          <button className={`${estilos.botonAccion} ${estilos.botonAccionPrimario}`} aria-label="Añadir nuevo">
            <Plus size={20} />
          </button>
          <button className={estilos.botonAccion} aria-label="Ayuda">
            <HelpCircle size={20} />
          </button>
          <button className={estilos.botonAccion} aria-label="Actividad">
            <Activity size={20} />
          </button>
          <button className={estilos.botonAccion} aria-label="Configuración">
            <Settings size={20} />
            <span className={estilos.indicadorNotificacion}></span>
          </button>
        </div>

        <div className={estilos.perfil}>
          <div className={estilos.infoPerfil}>
            <span className={estilos.nombrePerfil}>Administrador</span>
            <span className={estilos.rolPerfil}>Super admin</span>
          </div>
          <Image 
            src="/logo.svg" 
            alt="Avatar" 
            width={36} 
            height={36} 
            className={estilos.avatar}
          />
          <ChevronDown size={16} className={estilos.iconoDesplegable} />
        </div>
      </div>
    </header>
  );
}
