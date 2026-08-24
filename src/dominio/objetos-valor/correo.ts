/**
 * Objeto de valor que representa un correo electrónico válido.
 * Encapsula la validación de formato y garantiza inmutabilidad.
 */

/** Expresión regular para validar el formato básico de un correo electrónico */
const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LONGITUD_MAXIMA_CORREO = 254;

export class Correo {
  readonly valor: string;

  private constructor(valor: string) {
    this.valor = valor;
  }

  /**
   * Crea una instancia de Correo tras validar el formato.
   * @throws {Error} si el formato del correo es inválido
   */
  static crear(valor: string): Correo {
    const valorLimpio = valor.trim().toLowerCase();

    if (valorLimpio.length === 0) {
      throw new Error('El correo electrónico es obligatorio.');
    }

    if (valorLimpio.length > LONGITUD_MAXIMA_CORREO) {
      throw new Error(`El correo no puede superar los ${LONGITUD_MAXIMA_CORREO} caracteres.`);
    }

    if (!PATRON_CORREO.test(valorLimpio)) {
      throw new Error('El formato del correo electrónico no es válido.');
    }

    return new Correo(valorLimpio);
  }

  esIgualA(otro: Correo): boolean {
    return this.valor === otro.valor;
  }
}
