import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase singleton para toda la aplicación.
 *
 * Se instancia una sola vez usando las variables de entorno de Next.js
 * (prefijo NEXT_PUBLIC_). Exportar esta instancia desde un solo módulo
 * garantiza que no se creen múltiples conexiones innecesarias.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const llave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!url || !llave) {
  throw new Error(
    'Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(url, llave);
