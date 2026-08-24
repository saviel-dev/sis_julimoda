'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  esquemaInicioSesion,
  type DatosInicioSesion,
} from '@/aplicacion/esquemas/esquema-inicio-sesion';
import { IniciarSesion } from '@/aplicacion/casos-uso/iniciar-sesion';
import { AdaptadorAutenticacion } from '@/infraestructura/api/adaptador-autenticacion';
import { sesionLocal } from '@/infraestructura/almacenamiento/sesion-local';
import { CredencialesInvalidasError } from '@/dominio/errores/credenciales-invalidas-error';
import CampoTexto from '@/presentacion/componentes/campo-texto/campo-texto';
import CampoContrasena from '@/presentacion/componentes/campo-contrasena/campo-contrasena';
import BotonPrimario from '@/presentacion/componentes/boton-primario/boton-primario';
import estilos from './login_ropa.module.css';

/**
 * Vista principal del formulario de inicio de sesión de JuliModa.
 *
 * Conecta React Hook Form con el caso de uso IniciarSesion inyectando
 * el AdaptadorAutenticacion. Al autenticarse correctamente, guarda la
 * sesión en sessionStorage y redirige al panel administrativo.
 */
export default function LoginRopa() {
  const [errorGeneral, setErrorGeneral] = useState('');
  const router = useRouter();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DatosInicioSesion>({
    resolver: zodResolver(esquemaInicioSesion),
    defaultValues: {
      identificador: '',
      contrasena: '',
    },
  });

  const alEnviar = async (datos: DatosInicioSesion) => {
    setErrorGeneral('');

    try {
      const casoUso = new IniciarSesion(new AdaptadorAutenticacion());
      const sesion = await casoUso.ejecutar(datos.identificador, datos.contrasena);

      sesionLocal.guardar(sesion);

      /* Oculta la contraseña del estado antes de redirigir */
      reset();
      router.push('/admin/dashboard');
    } catch (error) {
      if (error instanceof CredencialesInvalidasError) {
        setErrorGeneral(error.message);
      } else {
        setErrorGeneral('Ocurrió un error al intentar iniciar sesión. Inténtalo de nuevo.');
      }
    }
  };

  return (
    <div className={estilos.pagina}>
      <div className={estilos.tarjeta}>
        {/* Encabezado con logo y título */}
        <div className={estilos.encabezado}>
          <Image
            src="/logo.svg"
            alt="JuliModa"
            width={64}
            height={64}
            className={estilos.logo}
            priority
          />
          <h1 className={estilos.titulo}>Iniciar sesión</h1>
          <p className={estilos.subtitulo}>
            Ingresa a tu cuenta para ver las nuevas colecciones.
          </p>
        </div>

        {/* Formulario */}
        <form
          className={estilos.formulario}
          onSubmit={handleSubmit(alEnviar)}
          noValidate
        >
          <Controller
            name="identificador"
            control={control}
            render={({ field }) => (
              <CampoTexto
                {...field}
                etiqueta="Correo electrónico o usuario"
                idCampo="identificador"
                type="text"
                autoComplete="username"
                mensajeError={errors.identificador?.message}
              />
            )}
          />

          <Controller
            name="contrasena"
            control={control}
            render={({ field }) => (
              <CampoContrasena
                {...field}
                etiqueta="Contraseña"
                idCampo="contrasena"
                mensajeError={errors.contrasena?.message}
              />
            )}
          />

          {/* Enlace para recuperar contraseña */}
          <a
            href="#"
            className={estilos.enlaceRecuperar}
            rel="noopener noreferrer"
          >
            ¿Olvidaste tu contraseña?
          </a>

          {/* Error general del servidor */}
          {errorGeneral.length > 0 && (
            <p className={estilos.errorGeneral} role="alert">
              {errorGeneral}
            </p>
          )}

          {/* Botón de envío */}
          <div className={estilos.contenedorBoton}>
            <BotonPrimario
              type="submit"
              texto="Iniciar sesión"
              estaEnviando={isSubmitting}
            />
          </div>
        </form>

        {/* Pie de página con enlace a registro */}
        <p className={estilos.piePagina}>
          ¿No tienes una cuenta?{' '}
          <a
            href="#"
            className={estilos.enlaceRegistro}
            rel="noopener noreferrer"
          >
            Regístrate aquí
          </a>
        </p>
      </div>
    </div>
  );
}
