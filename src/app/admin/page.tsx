import { redirect } from 'next/navigation';

/**
 * Redirige automáticamente /admin → /admin/dashboard
 */
export default function PaginaAdmin() {
  redirect('/admin/dashboard');
}
