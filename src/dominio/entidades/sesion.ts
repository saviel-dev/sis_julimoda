import type { Usuario } from './usuario';

/**
 * Entidad que representa una sesión activa tras un inicio
 * de sesión exitoso.
 */
export interface Sesion {
  readonly token: string;
  readonly usuario: Usuario;
}
