import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  variable: '--fuente-familia',
});

export const metadata: Metadata = {
  title: 'JuliModa — Iniciar sesión',
};

/**
 * Layout raíz de la aplicación.
 * Carga la fuente Roboto desde Google Fonts y aplica los
 * estilos globales con los tokens de diseño.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={roboto.className}>
      <body>{children}</body>
    </html>
  );
}
