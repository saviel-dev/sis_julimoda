'use client';

import { useState } from 'react';
import Sidebar from '@/presentacion/componentes/sidebar/sidebar';
import HeaderAdmin from '@/presentacion/componentes/header-admin/header-admin';
import estilos from './layout-admin.module.css';

interface PropsLayoutAdmin {
  children: React.ReactNode;
}

/**
 * Layout que envuelve todas las páginas del área administrativa.
 * Renderiza el Sidebar de navegación, el Header superior y el área
 * de contenido principal.
 */
export default function LayoutAdmin({ children }: PropsLayoutAdmin) {
  const [sidebarMinimizada, setSidebarMinimizada] = useState(false);

  return (
    <div className={estilos.contenedor}>
      <Sidebar minimizada={sidebarMinimizada} />
      <div className={estilos.principal}>
        <HeaderAdmin 
          minimizada={sidebarMinimizada}
          onToggleMinimizar={() => setSidebarMinimizada(!sidebarMinimizada)}
        />
        <main className={estilos.contenido}>{children}</main>
      </div>
    </div>
  );
}
