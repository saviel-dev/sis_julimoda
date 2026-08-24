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
  return (
    <div className={estilos.contenedor}>
      <Sidebar />
      <div className={estilos.principal}>
        <HeaderAdmin />
        <main className={estilos.contenido}>{children}</main>
      </div>
    </div>
  );
}
