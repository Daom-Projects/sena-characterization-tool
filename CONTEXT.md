# Project Context: sena-characterization-tool

## 1. Visión General
SPA (Single Page Application) para la **Caracterización Integral del Aprendiz SENA**. Automatiza tres instrumentos (Kolb, CHAEA, VAK) y está alineada con el **Diseño Universal para el Aprendizaje (DUA)** y la normativa SENA 2026 (Ley 2466, PIAR).

## 2. Stack Tecnológico
*   **Frontend**: HTML5, Tailwind CSS (CDN), Vanilla JS (ES Modules).
*   **Backend**: Google Apps Script (GAS) como API Serverless.
*   **Database**: Google Sheets.
*   **Hosting**: GitHub Pages / Cualquier servidor estático.

## 3. Arquitectura Modular (`js/`)
El proyecto ha sido refactorizado desde un monolito (`main.js`) a una arquitectura de **Módulos ES6 Nativos**:

### Componentes Principales
*   **`js/app.js` (Controller)**: Punto de entrada (`window.App`). Orquesta la inicialización, enrutamiento y renderizado. Conecta el Estado con las Vistas.
*   **`js/state.js` (Model)**: Gestor de estado (Singleton). Maneja `answers`, `scores`, `userProfile` y la persistencia en `localStorage`.
*   **`js/services.js` (Network)**: Capa de abstracción para la API de Google Apps Script (`checkUser`, `saveResults`). Retorna Promesas.
*   **`js/utils.js` (Helpers)**: Funciones puras para lógica de negocio (Cálculo de Kolb, conteo de respuestas, etc.).
*   **`js/views/*.js` (View)**: Cada pantalla es un módulo independiente que exporta una función renderizadora (retorna HTML string).
    *   `welcome.js`, `register.js`, `kolb.js`, `chaea.js`, `vak.js`, `results.js`, `guide.js`.

### Flujo Crítico de Datos
1.  **Registro**: `app.js` llama a `Services.checkUser()`. Si existe, hidrata el estado con `hydrateResultsFromServer`.
2.  **Evaluación**: `app.js` recibe eventos de las vistas (ej. `handleKolbInput`) y actualiza `State`.
3.  **Persistencia**: Cada cambio en `State` dispara un `localStorage.save()`.
4.  **Auto-Save**: Al finalizar VAK, `app.js` invoca `Services.saveResults()`.

## 4. Lógica de Interfaz
*   **Renderizado**: `App.render(scrollToTop)` redibuja la vista actual. `scrollToTop` permite controlar si la página salta al inicio (navegación) o mantiene posición (interacción).
*   **Header Dinámico**: `index.html` contiene `<div id="headerUser">` que es poblado por `app.js` con los datos del aprendiz.

## 5. Backend (Google Apps Script)
El script (ubicado en `server.gs` o referencia externa) maneja:
*   `doPost(e)`: Recibe JSON.
*   **Action 'check'**: Busca documento en Columna D.
*   **Action 'save'**: Guarda datos y envía correo.

## 6. Reglas de Desarrollo (LLM Instructions)
1.  **Módulos ES6**: Todo nuevo código JS debe ser modular. No agregar scripts globales fuera de `js/app.js` o sus submódulos.
2.  **Servidor Local**: Debido al uso de `type="module"`, **es obligatorio** usar un servidor local (Live Server) para desarrollo.
3.  **Año Dinámico**: Usar `new Date().getFullYear`.
4.  **Tailwind**: Mantener estilos con clases utilitarias.
5.  **Pure Views**: Las vistas (`js/views/*`) no deben tener efectos secundarios ni modificar el estado directamente; solo generan HTML y llaman métodos de `App`.