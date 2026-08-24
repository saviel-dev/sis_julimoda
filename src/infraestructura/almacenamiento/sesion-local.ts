import type { Sesion } from '@/dominio/entidades/sesion';

/** Clave usada en sessionStorage para guardar la sesión */
const CLAVE_SESION = 'julimoda_sesion';

/**
 * Utilidades para persistir la sesión activa en sessionStorage.
 *
 * Se usa sessionStorage (no localStorage) para que la sesión
 * se cierre automáticamente al cerrar la pestaña, reduciendo
 * el riesgo de acceso no autorizado en equipos compartidos.
 */
export const sesionLocal = {
  /**
   * Guarda la sesión activa.
   */
  guardar(sesion: Sesion): void {
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  },

  /**
   * Lee la sesión activa, o null si no existe.
   */
  leer(): Sesion | null {
    const valor = sessionStorage.getItem(CLAVE_SESION);
    if (!valor) return null;

    try {
      return JSON.parse(valor) as Sesion;
    } catch {
      return null;
    }
  },

  /**
   * Elimina la sesión activa (cierre de sesión).
   */
  eliminar(): void {
    sessionStorage.removeItem(CLAVE_SESION);
  },

  /**
   * Indica si hay una sesión activa.
   */
  existe(): boolean {
    return sessionStorage.getItem(CLAVE_SESION) !== null;
  },
};
