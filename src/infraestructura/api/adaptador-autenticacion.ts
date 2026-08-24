import type { RepositorioAutenticacion } from '@/dominio/puertos/repositorio-autenticacion';
import type { Sesion } from '@/dominio/entidades/sesion';

/**
 * Adaptador stub del repositorio de autenticación.
 *
 * Por ahora no se conecta a ningún backend real.
 * Cuando haya un endpoint disponible, esta clase implementará
 * la comunicación HTTP real.
 */
export class AdaptadorAutenticacion implements RepositorioAutenticacion {
  async iniciarSesion(_identificador: string, _contrasena: string): Promise<Sesion> {
    /* 
     * Stub: en el futuro este método hará una petición HTTP
     * al servidor de autenticación.
     */
    throw new Error('El servicio de autenticación aún no está disponible.');
  }
}
