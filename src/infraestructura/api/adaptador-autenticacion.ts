import type { RepositorioAutenticacion } from '@/dominio/puertos/repositorio-autenticacion';
import type { Sesion } from '@/dominio/entidades/sesion';
import { CredencialesInvalidasError } from '@/dominio/errores/credenciales-invalidas-error';
import { CREDENCIALES_ADMIN } from '@/dominio/objetos-valor/credenciales-admin';

/**
 * Adaptador de autenticación con validación de demostración.
 *
 * Valida contra las credenciales del administrador definidas en el dominio.
 * Cuando el backend real esté disponible, esta clase hará la petición HTTP
 * correspondiente sin cambiar la interfaz del caso de uso.
 */
export class AdaptadorAutenticacion implements RepositorioAutenticacion {
  async iniciarSesion(identificador: string, contrasena: string): Promise<Sesion> {
    const usuarioValido = identificador === CREDENCIALES_ADMIN.USUARIO;
    const contrasenaValida = contrasena === CREDENCIALES_ADMIN.CONTRASENA;

    if (!usuarioValido || !contrasenaValida) {
      throw new CredencialesInvalidasError();
    }

    return {
      token: 'demo-token-admin-julimoda',
      usuario: {
        id: '1',
        correo: 'admin@julimoda.com',
        nombre: 'Administrador',
      },
    };
  }
}
