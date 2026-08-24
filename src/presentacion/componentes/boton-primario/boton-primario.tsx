import type { ButtonHTMLAttributes } from 'react';
import estilos from './boton-primario.module.css';

interface PropsBotonPrimario extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  /** Texto visible del botón */
  texto: string;
  /** Texto alternativo durante el envío */
  textoEnvio?: string;
  /** Indica si el formulario se está enviando */
  estaEnviando?: boolean;
}

/**
 * Botón primario de acción.
 *
 * Se deshabilita automáticamente durante el envío y muestra
 * el texto alternativo "Iniciando sesión…".
 */
export default function BotonPrimario({
  texto,
  textoEnvio = 'Iniciando sesión…',
  estaEnviando = false,
  ...propsBoton
}: PropsBotonPrimario) {
  return (
    <button
      className={estilos.boton}
      disabled={estaEnviando}
      {...propsBoton}
    >
      {estaEnviando ? textoEnvio : texto}
    </button>
  );
}
