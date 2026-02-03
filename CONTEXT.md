# Project Context: sena-characterization-tool

## 1. Vision General
Este proyecto es una aplicación web estática (SPA) diseñada para la **Caracterización Integral del Aprendiz SENA** bajo el marco pedagógico de 2025. La herramienta automatiza la aplicación de tres instrumentos de diagnóstico (Kolb, CHAEA y VAK) para facilitar el **Diseño Universal para el Aprendizaje (DUA)** y cumplir con la **Reforma Laboral 2025 (Ley 2466)**.

## 2. Stack Tecnológico
*   **Frontend:** HTML5, Tailwind CSS (via CDN), JavaScript Vanilla (ES6+).
*   **Backend (Serverless):** Google Apps Script (GAS) como API REST.
*   **Base de Datos:** Google Sheets.
*   **Despliegue:** GitHub Pages (Entorno estático).

## 3. Arquitectura del Frontend (`main.js`)
La aplicación sigue un patrón SPA simple basado en un objeto global `App`.

### Estado (`App.state`)
El estado global maneja la navegación y los datos del usuario:
```javascript
{
    currentView: 'welcome', // Controla qué sección se renderiza
    questions: null,        // Cargado desde questions.json
    answers: {              // Almacena respuestas temporales
        kolb: {}, chaea: {}, vak: {} 
    },
    userProfile: {},        // Datos del registro (Nombre, Ficha, etc.)
    scores: {},             // Resultados calculados
    isExistingUser: false   // Bandera para prevenir reescritura de datos
}
```

### Ciclo de Vida
1.  **Init:** `App.init()` carga el DOM y `questions.json`.
2.  **Render:** `App.render()` inyecta HTML basado en `currentView`.
3.  **Navegación:** `App.navigate(view)` actualiza el estado y re-renderiza.

## 4. Flujo de Datos y Backend (`server.gs`)
La comunicación con Google Apps Script se realiza mediante `fetch` (POST) a `GAS_URL`.

### API Endpoints (Simulados en un solo `doPost`)
El backend maneja dos acciones principales definidas en el payload JSON:

1.  **`action: 'check'`**
    *   **Input:** `{ action: 'check', documento: '12345' }`
    *   **Lógica:** Busca el documento en la columna D de Google Sheets.
    *   **Output:** `{ status: 'found', data: { ... } }` o `{ status: 'not_found' }`.

2.  **`action: 'save'`**
    *   **Input:** Objeto completo con `userProfile` y `scores`.
    *   **Lógica:** Guarda una nueva fila con timestamp y envía un correo de confirmación.
    *   **Output:** `{ status: 'success', row: 15 }`.

### Esquema de Datos (Google Sheets)
El script espera y crea las siguientes columnas:
`Fecha | Nombre | Apellidos | Documento | Email | Programa | Ficha | Resultado_Kolb | Kolb_X | Kolb_Y | Resultado_CHAEA | CHAEA_Activo | ... | Resultado_VAK | ...`

## 5. Guía de Instrumentos (`questions.json`)
*   **Kolb:** Ranking de 4 opciones por fila (1-4). Requiere validación de unicidad.
*   **CHAEA:** 80 preguntas dicotómicas (De acuerdo / En desacuerdo).
*   **VAK:** Preguntas de selección múltiple (Visual, Auditivo, Kinestésico).

## 6. Reglas de Desarrollo
*   **No Frameworks:** Mantener el uso de Vanilla JS para facilitar la edición simple y el despliegue ligero.
*   **Tailwind:** Usar clases de utilidad para todo el estilizado. Evitar CSS personalizado excepto para animaciones específicas.
*   **CORS:** `GAS_URL` debe estar desplegado como "Web App" con permisos "Anyone". Las pruebas locales pueden requerir manejo de errores de CORS o mocks si no está configurado correctamente.