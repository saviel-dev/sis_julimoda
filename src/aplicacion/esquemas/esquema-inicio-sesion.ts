import { z } from 'zod';

/**
 * Longitudes mínimas y máximas para los campos del formulario.
 * Centralizadas para evitar números mágicos en la vista.
 */
const LONGITUD_MINIMA_IDENTIFICADOR = 3;
const LONGITUD_MINIMA_CONTRASENA = 8;
const LONGITUD_MAXIMA_CONTRASENA = 128;

/**
 * Esquema Zod para la validación del formulario de inicio de sesión.
 * La vista usa este esquema con React Hook Form vía @hookform/resolvers.
 */
export const esquemaInicioSesion = z.object({
  identificador: z
    .string()
    .trim()
    .min(LONGITUD_MINIMA_IDENTIFICADOR, {
      message: `Debe tener al menos ${LONGITUD_MINIMA_IDENTIFICADOR} caracteres.`,
    }),
  contrasena: z
    .string()
    .min(LONGITUD_MINIMA_CONTRASENA, {
      message: `La contraseña debe tener al menos ${LONGITUD_MINIMA_CONTRASENA} caracteres.`,
    })
    .max(LONGITUD_MAXIMA_CONTRASENA, {
      message: `La contraseña no puede superar los ${LONGITUD_MAXIMA_CONTRASENA} caracteres.`,
    }),
});

/** Tipo inferido del esquema para tipar el formulario */
export type DatosInicioSesion = z.infer<typeof esquemaInicioSesion>;
