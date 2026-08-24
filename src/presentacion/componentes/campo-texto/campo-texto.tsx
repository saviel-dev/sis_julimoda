'use client';

import { useState, forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import estilos from './campo-texto.module.css';

/**
 * Props del componente CampoTexto.
 * Extiende los atributos nativos de <input> para permitir
 * pasar cualquier prop estándar (autoComplete, etc.).
 */
interface PropsCampoTexto extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  /** Texto de la etiqueta flotante */
  etiqueta: string;
  /** Identificador único que vincula el <label> con el <input> */
  idCampo: string;
  /** Ícono opcional alineado a la izquierda */
  icono?: ReactNode;
  /** Mensaje de error de validación */
  mensajeError?: string;
  /** Contenido adicional dentro del campo (botón de visibilidad, etc.) */
  contenidoDerecho?: ReactNode;
}

/**
 * Campo de texto outlined con etiqueta flotante estilo Google.
 *
 * Usa forwardRef para integrarse con React Hook Form,
 * que necesita acceso directo al <input>.
 */
const CampoTexto = forwardRef<HTMLInputElement, PropsCampoTexto>(
  function CampoTexto(
    { etiqueta, idCampo, icono, mensajeError, contenidoDerecho, ...propsInput },
    ref
  ) {
    const [estaEnfocado, setEstaEnfocado] = useState(false);

    /**
     * La etiqueta "flota" cuando el campo tiene foco o cuando
     * hay un valor escrito (verificamos via el value prop).
     */
    const tieneValor = typeof propsInput.value === 'string' && propsInput.value.length > 0;
    const etiquetaActiva = estaEnfocado || tieneValor;
    const tieneError = typeof mensajeError === 'string' && mensajeError.length > 0;
    const idError = `${idCampo}-error`;

    /** Clases condicionales para el campo */
    const clasesCampo = [
      estilos.campo,
      icono ? estilos.campoConIcono : '',
      tieneError ? estilos.campoError : '',
    ]
      .filter(Boolean)
      .join(' ');

    /** Clases condicionales para la etiqueta */
    const clasesEtiqueta = [
      estilos.etiqueta,
      icono && !etiquetaActiva ? estilos.etiquetaConIcono : '',
      etiquetaActiva ? estilos.etiquetaActiva : '',
      tieneError ? estilos.etiquetaError : '',
    ]
      .filter(Boolean)
      .join(' ');

    /** Clases condicionales para el ícono */
    const clasesIcono = [
      estilos.icono,
      estaEnfocado ? estilos.iconoActivo : '',
      tieneError ? estilos.iconoError : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={estilos.contenedor}>
        {icono && <div className={clasesIcono}>{icono}</div>}

        <input
          ref={ref}
          id={idCampo}
          className={clasesCampo}
          aria-invalid={tieneError}
          aria-describedby={tieneError ? idError : undefined}
          onFocus={(evento) => {
            setEstaEnfocado(true);
            propsInput.onFocus?.(evento);
          }}
          onBlur={(evento) => {
            setEstaEnfocado(false);
            propsInput.onBlur?.(evento);
          }}
          {...propsInput}
        />

        <label htmlFor={idCampo} className={clasesEtiqueta}>
          {etiqueta}
        </label>

        {contenidoDerecho}

        {tieneError && (
          <p id={idError} className={estilos.mensajeError} role="alert">
            {mensajeError}
          </p>
        )}
      </div>
    );
  }
);

export default CampoTexto;
