/**
 * Error de dominio lanzado cuando las credenciales proporcionadas
 * no coinciden con ninguna cuenta registrada.
 *
 * El mensaje es deliberadamente genérico para no revelar
 * si el identificador (correo o usuario) existe en el sistema.
 */
export class CredencialesInvalidasError extends Error {
  readonly nombre = 'CredencialesInvalidasError';

  constructor() {
    super('El identificador o la contraseña son incorrectos. Verifica tus datos e intenta de nuevo.');
  }
}
