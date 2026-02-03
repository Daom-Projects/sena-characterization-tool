# Herramienta de Caracterización SENA (Versión 2026)

Esta aplicación web facilita la caracterización integral de aprendices del SENA mediante la aplicación automatizada de tres instrumentos pedagógicos: **Kolb, CHAEA y VAK**.

Diseñada bajo los lineamientos de la **Reforma Laboral y el Reglamento del Aprendiz 2026** para apoyar el Diseño Universal para el Aprendizaje (DUA) y la creación de planes PIAR.

## 🚀 Nuevas Funcionalidades (v2.1 Modular)

### Arquitectura Moderna
-   **Modularidad ES6**: Código refactorizado en módulos (`js/app.js`, `js/views/*`, etc.) para mayor mantenibilidad y orden.
-   **Separación de Responsabilidades**: Lógica clara entre Vistas, Estado y Servicios.

### Experiencia de Usuario (UX)
-   **Anualidad Dinámica**: El sistema detecta y muestra automáticamente el año en curso (ej. "SENA 2026").
-   **Matriz de Selección Kolb**: Nueva interfaz de cuadrícula inteligente que evita respuestas duplicadas automáticamente.
-   **Navegación Fluida**: Mejoras en el scroll para evitar saltos innecesarios al responder preguntas.

### Automatización y Persistencia
-   **Guardado Automático (Auto-Save)**: Al finalizar el último test (VAK), los resultados se envían automáticamente a la nube.
-   **Recuperación de Estado**: `localStorage` mantiene el progreso del usuario si cierra el navegador.
-   **Hidratación de Resultados**: Al buscar un usuario existente, el sistema recalculas los perfiles en tiempo real.

## 📋 Instrumentos Incluidos
1.  **Kolb**: Ejes de Percepción (X) y Procesamiento (Y). Determina si el aprendiz es Divergente, Asimilador, Convergente o Acomodador.
2.  **CHAEA**: Preferencias de aprendizaje (Activo, Reflexivo, Teórico, Pragmático).
3.  **VAK**: Canal sensorial predominante (Visual, Auditivo, Kinestésico).

## 🛠️ Instalación y Configuración

### Requisitos Previos
Debido al uso de **ES Modules**, esta aplicación **NO** puede abrirse haciendo doble clic en `index.html`. Debes usar un servidor local.

**Opción A: VS Code (Recomendado)**
1.  Instala la extensión "Live Server".
2.  Clic derecho en `index.html` -> "Open with Live Server".

**Opción B: Python**
```bash
python -m http.server 8000
# Abre http://localhost:8000
```

### Configuración del Backend
1.  Copia el script `server.gs` (si lo tienes disponible) en un nuevo proyecto de Google Apps Script.
2.  Despliégalo como Web App (Acceso: "Cualquier persona").
3.  Edita `js/services.js` y actualiza la constante `GAS_URL`.

## 📂 Estructura del Proyecto
```
/
├── index.html          # SPA Shell
├── questions.json      # Base de preguntas y textos
├── js/
│   ├── app.js          # Controlador Principal
│   ├── state.js        # Gestión de Datos (Store)
│   ├── services.js     # API Client (Google Apps Script)
│   ├── utils.js        # Funciones Puras
│   └── views/          # Módulos de Vista (Retornan HTML)
│       ├── kolb.js
│       ├── register.js
│       └── ...
└── ...
```

## 🤝 Contribución
Este proyecto es de código abierto para la comunidad SENA.
1.  Fork del repositorio.
2.  Ramas tipo `feature/mi-mejora`.
3.  Pull Request describiendo los cambios DUA o técnicos.

## 📄 Licencia
Uso libre educativo bajo reconocimiento al autor. SENA - Regional Boyacá - Centro Minero - 2026