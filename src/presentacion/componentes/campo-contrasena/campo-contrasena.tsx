'use client';

import { useState, forwardRef, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import CampoTexto from '@/presentacion/componentes/campo-texto/campo-texto';
import estilos from './campo-contrasena.module.css';

/** Tamaño de los íconos de visibilidad en píxeles */
const TAMANO_ICONO_VISIBILIDAD = 20;

/**
 * Props del componente CampoContrasena.
 * No extiende InputHTMLAttributes directamente porque delega
 * al CampoTexto, que ya los maneja.
 */
interface PropsCampoContrasena extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> {
  /** Texto de la etiqueta flotante */
  etiqueta: string;
  /** Identificador único del campo */
  idCampo: string;
  /** Mensaje de error de validación */
  mensajeError?: string;
}

/**
 * Campo de contraseña con botón para mostrar/ocultar el texto.
 *
 * Implementado como <button type="button"> para no enviar el
 * formulario. Cambia aria-label y aria-pressed según el estado.
 */
const CampoContrasena = forwardRef<HTMLInputElement, PropsCampoContrasena>(
  function CampoContrasena({ etiqueta, idCampo, mensajeError, ...propsInput }, ref) {
    const [contrasenaVisible, setContrasenaVisible] = useState(false);

    const alternarVisibilidad = () => {
      setContrasenaVisible((anterior) => !anterior);
    };

    const etiquetaBoton = contrasenaVisible ? 'Ocultar contraseña' : 'Mostrar contraseña';

    const botonVisibilidad = (
      <button
        type="button"
        className={estilos.botonVisibilidad}
        onClick={alternarVisibilidad}
        aria-label={etiquetaBoton}
        aria-pressed={contrasenaVisible}
      >
        {contrasenaVisible ? (
          <EyeOff size={TAMANO_ICONO_VISIBILIDAD} />
        ) : (
          <Eye size={TAMANO_ICONO_VISIBILIDAD} />
        )}
      </button>
    );

    return (
      <div className={estilos.contenedorContrasena}>
        <CampoTexto
          ref={ref}
          etiqueta={etiqueta}
          idCampo={idCampo}
          type={contrasenaVisible ? 'text' : 'password'}
          autoComplete="current-password"
          mensajeError={mensajeError}
          contenidoDerecho={botonVisibilidad}
          {...propsInput}
        />
      </div>
    );
  }
);

export default CampoContrasena;
