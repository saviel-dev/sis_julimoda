import type { RepositorioAutenticacion } from '@/dominio/puertos/repositorio-autenticacion';
import type { Sesion } from '@/dominio/entidades/sesion';
import { Identificador } from '@/dominio/objetos-valor/identificador';
import { Contrasena } from '@/dominio/objetos-valor/contrasena';

/**
 * Caso de uso para iniciar sesión.
 *
 * Recibe el repositorio de autenticación por constructor (inyección
 * de dependencias) para que sea testeable con dobles.
 */
export class IniciarSesion {
  private readonly repositorio: RepositorioAutenticacion;

  constructor(repositorio: RepositorioAutenticacion) {
    this.repositorio = repositorio;
  }

  /**
   * Ejecuta el flujo de inicio de sesión:
   * 1. Valida el identificador y la contraseña con objetos de valor.
   * 2. Delega la autenticación al repositorio inyectado.
   *
   * @throws Error de validación si el formato es incorrecto
   * @throws CredencialesInvalidasError si las credenciales no coinciden
   */
  async ejecutar(identificadorCrudo: string, contrasenaCruda: string): Promise<Sesion> {
    const identificador = Identificador.crear(identificadorCrudo);
    const contrasena = Contrasena.crear(contrasenaCruda);

    return this.repositorio.iniciarSesion(identificador.valor, contrasena.valor);
  }
}
