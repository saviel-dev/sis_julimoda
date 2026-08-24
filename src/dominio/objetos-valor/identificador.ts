/**
 * Objeto de valor que representa el identificador del usuario
 * para iniciar sesión. Puede ser un correo electrónico o un
 * nombre de usuario.
 */

const LONGITUD_MINIMA_USUARIO = 3;
const LONGITUD_MAXIMA_USUARIO = 50;

export type TipoIdentificador = 'correo' | 'usuario';

export class Identificador {
  readonly valor: string;
  readonly tipo: TipoIdentificador;

  private constructor(valor: string, tipo: TipoIdentificador) {
    this.valor = valor;
    this.tipo = tipo;
  }

  /**
   * Determina si el valor parece un correo electrónico
   * buscando la presencia de '@'.
   */
  private static esCorreo(valor: string): boolean {
    return valor.includes('@');
  }

  /**
   * Crea un Identificador validando el formato según su tipo.
   * @throws {Error} si el identificador no cumple los requisitos
   */
  static crear(valor: string): Identificador {
    const valorLimpio = valor.trim();

    if (valorLimpio.length === 0) {
      throw new Error('El usuario o correo electrónico es obligatorio.');
    }

    if (Identificador.esCorreo(valorLimpio)) {
      return new Identificador(valorLimpio.toLowerCase(), 'correo');
    }

    if (valorLimpio.length < LONGITUD_MINIMA_USUARIO) {
      throw new Error(`El nombre de usuario debe tener al menos ${LONGITUD_MINIMA_USUARIO} caracteres.`);
    }

    if (valorLimpio.length > LONGITUD_MAXIMA_USUARIO) {
      throw new Error(`El nombre de usuario no puede superar los ${LONGITUD_MAXIMA_USUARIO} caracteres.`);
    }

    return new Identificador(valorLimpio, 'usuario');
  }
}
