'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sesionLocal } from '@/infraestructura/almacenamiento/sesion-local';
import LayoutAdmin from '@/presentacion/componentes/layout-admin/layout-admin';

/**
 * Layout raíz del área administrativa.
 *
 * Verifica que haya una sesión activa en sessionStorage antes de
 * renderizar el contenido. Si no la hay, redirige al login.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!sesionLocal.existe()) {
      router.replace('/');
    }
  }, [router]);

  return <LayoutAdmin>{children}</LayoutAdmin>;
}
