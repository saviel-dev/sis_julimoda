# JuliModa — Interfaz de Autenticación

Este repositorio contiene la interfaz web de inicio de sesión para **JuliModa**, una tienda de ropa. El proyecto ha sido diseñado priorizando la accesibilidad, la estética (con un fondo degradado y patrón cuadriculado leve) y una arquitectura limpia y escalable.

## Stack Tecnológico

- **Framework:** Next.js (App Router)
- **Lenguaje:** TypeScript (Modo `strict`)
- **Estilos:** CSS Modules con Variables CSS (Tokens de diseño)
- **Formularios:** React Hook Form
- **Validación:** Zod
- **Iconografía:** Lucide React
- **Pruebas:** Vitest y Testing Library

## Arquitectura (Clean Architecture)

El proyecto está estructurado separando responsabilidades en distintas capas, de forma que el dominio de la aplicación no dependa de React, Next.js ni del navegador.

```text
src/
├── app/               # Enrutamiento de Next.js (layout, page, globales)
├── dominio/           # Entidades, objetos de valor, errores y puertos (interfaces)
├── aplicacion/        # Casos de uso de la aplicación (ej. iniciar-sesion)
├── infraestructura/   # Implementaciones concretas (adaptadores de API, repositorios)
├── presentacion/      # Componentes UI reutilizables, vistas y tokens CSS
└── __tests__/         # Pruebas unitarias de dominio y casos de uso
```

## Características de la Interfaz

1. **Diseño a Medida:** No se utilizan librerías de componentes externas (como MUI o Bootstrap). Todos los componentes (campos de texto flotantes tipo Google, botones, tarjetas) han sido creados desde cero utilizando CSS Modules y tokens de diseño.
2. **Accesibilidad (A11y):** Inclusión de etiquetas `aria-*`, soporte completo para navegación por teclado con foco visible y compatibilidad con lectores de pantalla.
3. **Validación Robusta:** Validación de formularios manejada por Zod y encapsulada a nivel de dominio mediante objetos de valor (`Correo`, `Contrasena`, `Identificador`).
4. **Diseño Adaptable:** Interfaz responsive y fluida, optimizada hasta 320px de ancho.

## Requisitos Previos

- Node.js 18.17 o superior.
- npm (o gestor de paquetes equivalente).

## Instalación y Ejecución

1. Instala las dependencias del proyecto:

   ```bash
   npm install
   ```

2. Ejecuta el servidor de desarrollo:

   ```bash
   npm run dev
   ```

3. Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la interfaz.

## Pruebas

El proyecto cuenta con pruebas unitarias para garantizar la correcta funcionalidad de la capa de dominio y los casos de uso. Para ejecutar la suite de pruebas con Vitest, utiliza:

```bash
npm run test
```

*(El comando subyacente configurado es `vitest run` o `vitest dev` dependiendo de tu `package.json`)*.
