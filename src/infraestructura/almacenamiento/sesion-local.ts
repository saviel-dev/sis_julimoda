import { supabase } from '@/infraestructura/supabase/cliente-supabase';
import type { Sesion } from '@/dominio/entidades/sesion';

/**
 * Utilidades para manejar la sesión activa.
 *
 * La sesión real la gestiona Supabase internamente. Este módulo
 * actúa como puente para la capa de presentación, ofreciendo
 * las mismas funciones que antes pero ahora delegando en Supabase Auth.
 */
export const sesionLocal = {
  /** Guarda la sesión (delegado a Supabase; el token se preserva internamente). */
  guardar(_sesion: Sesion): void {
    // Supabase gestiona el token en su propio almacenamiento.
    // No necesitamos persistir nada manualmente.
  },

  /**
   * Lee la sesión activa desde Supabase de manera síncrona.
   * Para verificación async usa `sesionLocal.leerAsync()`.
   */
  leer(): Sesion | null {
    // Lectura síncrona aproximada: Supabase guarda la sesión
    // en localStorage bajo la clave sb-<ref>-auth-token
    if (typeof window === 'undefined') return null;

    const llaves = Object.keys(localStorage).filter((k) =>
      k.includes('-auth-token')
    );
    return llaves.length > 0 ? ({ token: 'activa', usuario: { id: '', correo: '', nombre: '' } } as Sesion) : null;
  },

  /** Lee la sesión activa de forma asíncrona (más precisa). */
  async leerAsync(): Promise<Sesion | null> {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return null;

    return {
      token: data.session.access_token,
      usuario: {
        id: data.session.user.id,
        correo: data.session.user.email ?? '',
        nombre: data.session.user.user_metadata?.nombre ?? data.session.user.email ?? '',
      },
    };
  },

  /** Cierra la sesión activa en Supabase. */
  async eliminar(): Promise<void> {
    await supabase.auth.signOut();
  },

  /** Indica si hay una sesión activa. */
  existe(): boolean {
    if (typeof window === 'undefined') return false;
    const llaves = Object.keys(localStorage).filter((k) =>
      k.includes('-auth-token')
    );
    return llaves.length > 0;
  },
};
