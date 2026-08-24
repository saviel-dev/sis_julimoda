/**
 * Entidad que representa un usuario autenticado del sistema.
 */
export interface Usuario {
  readonly id: string;
  readonly correo: string;
  readonly nombre: string;
}
