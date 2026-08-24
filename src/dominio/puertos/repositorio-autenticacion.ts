import type { Sesion } from '../entidades/sesion';

/**
 * Puerto que define el contrato para autenticar usuarios.
 * La implementación concreta vive en la capa de infraestructura.
 */
export interface RepositorioAutenticacion {
  /**
   * Intenta iniciar sesión con el identificador y la contraseña.
   * @param identificador - Correo electrónico o nombre de usuario
   * @param contrasena - Contraseña del usuario
   * @returns La sesión creada si las credenciales son válidas
   * @throws {CredencialesInvalidasError} si las credenciales no coinciden
   */
  iniciarSesion(identificador: string, contrasena: string): Promise<Sesion>;
}
