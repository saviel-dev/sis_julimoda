'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { Lock } from 'lucide-react';
import {
  esquemaInicioSesion,
  type DatosInicioSesion,
} from '@/aplicacion/esquemas/esquema-inicio-sesion';
import CampoTexto from '@/presentacion/componentes/campo-texto/campo-texto';
import CampoContrasena from '@/presentacion/componentes/campo-contrasena/campo-contrasena';
import BotonPrimario from '@/presentacion/componentes/boton-primario/boton-primario';
import estilos from './login_ropa.module.css';

/** Tamaño de los íconos del formulario en píxeles */
const TAMANO_ICONO = 20;

/**
 * Vista principal del formulario de inicio de sesión de JuliModa.
 *
 * Integra React Hook Form con Zod para validación y usa los
 * componentes de presentación (CampoTexto, CampoContrasena,
 * BotonPrimario). No contiene lógica de negocio.
 */
export default function LoginRopa() {
  const [errorGeneral, setErrorGeneral] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosInicioSesion>({
    resolver: zodResolver(esquemaInicioSesion),
    defaultValues: {
      identificador: '',
      contrasena: '',
    },
  });

  const alEnviar = async (_datos: DatosInicioSesion) => {
    setErrorGeneral('');

    /**
     * Aquí se inyectaría el caso de uso IniciarSesion con el
     * adaptador de autenticación cuando el backend esté disponible.
     *
     * Ejemplo:
     * const casoUso = new IniciarSesion(new AdaptadorAutenticacion());
     * const sesion = await casoUso.ejecutar(datos.identificador, datos.contrasena);
     */
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
