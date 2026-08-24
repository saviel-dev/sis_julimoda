/**
 * Objeto de valor que representa una contraseña validada.
 * Solo verifica restricciones de formato; la verificación real
 * ocurre en el servidor.
 */

const LONGITUD_MINIMA = 8;
const LONGITUD_MAXIMA = 128;

export class Contrasena {
  readonly valor: string;

  private constructor(valor: string) {
    this.valor = valor;
  }

  /**
   * Crea una instancia de Contrasena tras validar la longitud.
   * @throws {Error} si la contraseña no cumple los requisitos de longitud
   */
  static crear(valor: string): Contrasena {
    if (valor.length === 0) {
      throw new Error('La contraseña es obligatoria.');
    }

    if (valor.length < LONGITUD_MINIMA) {
      throw new Error(`La contraseña debe tener al menos ${LONGITUD_MINIMA} caracteres.`);
    }

    if (valor.length > LONGITUD_MAXIMA) {
      throw new Error(`La contraseña no puede superar los ${LONGITUD_MAXIMA} caracteres.`);
    }

    return new Contrasena(valor);
  }
}
