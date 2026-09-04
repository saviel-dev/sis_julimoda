import { supabase } from '@/infraestructura/supabase/cliente-supabase';
import type { RepositorioAutenticacion } from '@/dominio/puertos/repositorio-autenticacion';
import type { Sesion } from '@/dominio/entidades/sesion';
import { CredencialesInvalidasError } from '@/dominio/errores/credenciales-invalidas-error';

/**
 * Adaptador de autenticación que usa Supabase Auth.
 *
 * Supabase gestiona el token y la sesión internamente. Aquí solo
 * validamos el resultado y lo mapeamos a la entidad Sesion del dominio.
 */
export class AdaptadorAutenticacion implements RepositorioAutenticacion {
  async iniciarSesion(identificador: string, contrasena: string): Promise<Sesion> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: identificador,
      password: contrasena,
    });

    if (error || !data.session || !data.user) {
      throw new CredencialesInvalidasError();
    }

    return {
      token: data.session.access_token,
      usuario: {
        id: data.user.id,
        correo: data.user.email ?? '',
        nombre: data.user.user_metadata?.nombre ?? data.user.email ?? 'Usuario',
      },
    };
  }
}
