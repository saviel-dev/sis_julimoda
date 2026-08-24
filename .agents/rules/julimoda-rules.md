---
trigger: always_on
---

# Reglas del agente — JuliModa

Reglas obligatorias para todo el trabajo en este proyecto. Si una instrucción del chat
contradice estas reglas, avisa antes de continuar.

## Contexto

JuliModa es una tienda de ropa. La interfaz debe transmitir confianza, cercanía y
profesionalismo. Entregable principal: `login_ropa.tsx`, un formulario de inicio de
sesión con campo de usuario o correo, campo de contraseña con botón para mostrar y
ocultar el texto, botón "Iniciar sesión" y enlaces para recuperar contraseña y crear
cuenta. Usa `logo.png` como logotipo.

## Reglas fundamentales

1. Mantén flat design con colores sólidos: sin degradados, sombras, brillos, texturas,
   neumorfismo ni efectos de vidrio.
2. Usa únicamente la paleta de la sección "Colores". No agregues ningún otro color.
3. Mantén una estética sencilla, profesional, pequeña y compacta.
4. No crees builds, no subas cambios y no hagas commits a GitHub.
5. Escribe el código, los comentarios y la documentación en español.
6. Aplica buenas prácticas, código limpio y Clean Architecture.

## Prohibiciones operativas

- No ejecutes `npm run build`, `next build`, `npm run deploy` ni ningún despliegue.
- No ejecutes `git add`, `git commit`, `git push`, `git merge`, `git tag`, ni crees
  ramas o pull requests.
- No modifiques configuración del repositorio, flujos de CI/CD ni secretos.
- No instales dependencias fuera de las aprobadas en "Stack".
- Entrega solo código fuente y documentación; el versionado lo hace la persona usuaria.

## Stack

- Lenguaje: TypeScript en modo `strict`. Prohibido `any`, implícito o explícito.
- Framework: React con Next.js (App Router). Todo componente en `.tsx`.
- Tiempo real: WebSocket (Socket.IO o Supabase Realtime), aislado en infraestructura.
- Estilos: CSS Modules con variables CSS.
- Formularios y validación: React Hook Form con Zod.
- Pruebas: Vitest y Testing Library.
- No uses librerías de componentes (MUI, Bootstrap, Chakra, Ant Design). Construye la
  interfaz a mano con los tokens de este documento.
- Instancia el cliente de tiempo real una sola vez y expónlo mediante un puerto del
  dominio; nunca lo importes desde un componente.

## Colores

Declara estos tokens como variables CSS y no escribas valores hexadecimales sueltos en
los componentes.

```css
:root {
  --color-primario: #770dee;          /* Acciones principales, foco, enlaces */
  --color-primario-oscuro: #6009c4;   /* Hover y estado activo */
  --color-primario-suave: #f3e9fe;    /* Fondo sutil de hover e íconos */
  --color-blanco: #ffffff;            /* Tarjeta y campos */
  --color-fondo: #fafafa;             /* Lienzo de la página */
  --color-texto: #1f1f1f;             /* Texto principal */
  --color-texto-secundario: #5f6368;  /* Etiquetas, ayudas, deshabilitado */
  --color-borde: #dadce0;             /* Borde de campos en reposo */
  --color-error: #b3261e;             /* Validación */
}
```

- No agregues tonos nuevos, opacidades arbitrarias ni colores de éxito, aviso o
  información mientras la interfaz no los necesite.
- `#770dee` sobre blanco da un contraste aproximado de 6.8:1 y cumple WCAG AA, igual que
  el texto blanco sobre el botón primario.

## Interfaz

### Campos de texto (estética Google)

- Campo outlined: fondo blanco, borde de 1 px `--color-borde`, radio de 8 px.
- Etiqueta flotante: en reposo va dentro del campo; al enfocar o con contenido sube y se
  recorta sobre el borde superior.
- Foco: borde de 2 px en `--color-primario` y etiqueta del mismo color. Sin sombras.
- Error: borde de 2 px en `--color-error` y mensaje de una línea debajo del campo.
- Alto del campo: 56 px. Separación vertical entre campos: 16 px.

### Botones

- Primario: fondo `--color-primario`, texto blanco, radio de 24 px, alto de 40 px, sin
  sombra. Hover: `--color-primario-oscuro`.
- Secundario o de texto: solo texto en `--color-primario`; hover con fondo
  `--color-primario-suave`.
- Durante el envío, deshabilita el botón y muestra "Iniciando sesión…". Sin animaciones
  decorativas.

### Tarjeta y espaciado

- Tarjeta centrada, ancho máximo de 400 px, radio de 8 px, borde de 1 px
  `--color-borde`, relleno de 40 px y de 24 px en móvil. Sin sombra.
- Usa una escala de espaciado en múltiplos de 8 px.
- Tipografía Roboto con respaldo en la fuente del sistema. Título 24 px, cuerpo y campos
  16 px, ayudas y errores 12 px. Peso 400.

### Iconografía

- Usa Material Symbols Rounded (peso 300 a 400) o Lucide con extremos redondeados.
  Trazo lineal, sin relleno, 24 px, en `--color-texto-secundario`.
- Íconos permitidos en esta pantalla: `person`, `mail`, `lock`, `visibility`,
  `visibility_off` y una percha o bolsa de compras para la marca.
- No uses ilustraciones, emojis ni íconos de varios colores.

### Mostrar y ocultar contraseña

- Coloca el ícono `visibility` o `visibility_off` alineado a la derecha, dentro del campo.
- Impleméntalo como `<button type="button">` para que no envíe el formulario.
- Cambia el `aria-label` entre "Mostrar contraseña" y "Ocultar contraseña" y usa
  `aria-pressed`.
- Vuelve a ocultar la contraseña al enviar el formulario.

### Accesibilidad

- Asocia cada campo con un `<label>` real mediante `htmlFor`.
- Mantén el foco visible por teclado en todos los controles interactivos.
- Usa `aria-invalid` y `aria-describedby` cuando haya error y anuncia el resumen con
  `role="alert"`.
- Usa `autocomplete="username"` y `autocomplete="current-password"`.
- Haz el diseño adaptable hasta 320 px y respeta `prefers-reduced-motion`.

### Textos

- Escribe en voz activa, español neutro y formato oración: "Iniciar sesión", no
  "INICIO DE SESIÓN".
- Los errores explican qué pasó y cómo resolverlo, sin disculpas ni vaguedades.
- Un fallo de credenciales nunca revela si la cuenta existe.

## Clean Architecture

La dependencia apunta siempre hacia adentro: presentación, luego aplicación, luego
dominio. El dominio no conoce React, Next.js, `fetch` ni el navegador.

```
src/
├── dominio/
│   ├── entidades/          # Usuario, Sesion
│   ├── objetos-valor/      # Correo, Contrasena, Identificador
│   ├── puertos/            # RepositorioAutenticacion (interfaz)
│   └── errores/            # CredencialesInvalidasError
├── aplicacion/
│   └── casos-uso/          # iniciarSesion.ts
├── infraestructura/
│   ├── api/                # ClienteHttp y adaptador del repositorio
│   ├── tiempo-real/        # Adaptador de WebSocket
│   └── almacenamiento/     # Manejo de sesión
├── presentacion/
│   ├── componentes/        # CampoTexto, CampoContrasena, BotonPrimario
│   ├── vistas/             # login_ropa.tsx
│   └── estilos/            # tokens.css
└── compartido/             # Utilidades sin dependencias externas
```

- Inyecta las dependencias de los casos de uso por constructor o parámetros; nunca las
  importes directamente.
- Implementa las validaciones de formato de correo y longitud de contraseña como objetos
  de valor del dominio. La interfaz solo muestra el resultado.
- Prueba cada capa de forma aislada y usa un doble del repositorio en los casos de uso.

## Convenciones de código

- Nombra en español: `iniciarSesion`, `estaCargando`, `mensajeError`,
  `RepositorioUsuario`. Conserva en inglés solo las APIs del framework, como `useState`
  u `onSubmit`.
- Usa `camelCase` para variables y funciones, `PascalCase` para clases, tipos y
  componentes, y `kebab-case` para archivos y carpetas.
- Escribe funciones cortas, con una sola responsabilidad y retorno temprano. Evita el
  anidamiento profundo.
- Explica en los comentarios el porqué, no el qué. No dejes código comentado ni `TODO`
  sin responsable.
- No uses números ni textos mágicos: declara constantes con nombre.
- Maneja los errores de forma explícita con tipos de resultado o excepciones del
  dominio. Nunca dejes un `catch` vacío.

## Seguridad

- No registres la contraseña en consola, analítica ni mensajes de error.
- No guardes la contraseña en estado global, `localStorage` ni en la URL.
- Resuelve la autenticación siempre contra el servidor; el cliente no decide
  autorización.
- Aplica limitación de intentos y usa `rel="noopener noreferrer"` en enlaces externos.

## Verificación antes de entregar

- Todos los colores provienen de los tokens definidos.
- No hay sombras, degradados ni radios fuera de los valores indicados.
- La tarjeta mide 400 px o menos y se ve bien a 320 px.
- El botón de mostrar contraseña funciona, es `type="button"` y anuncia su estado.
- Código, comentarios, textos de interfaz y documentación en español.
- El dominio no importa nada de React, Next.js ni del navegador.
- Los casos de uso tienen pruebas con dobles de sus dependencias.
- No se ejecutó ningún build ni comando de Git.