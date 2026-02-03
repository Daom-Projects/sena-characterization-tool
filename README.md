# Herramienta de Caracterización SENA 2025

Esta aplicación web facilita la caracterización integral de aprendices del SENA mediante la aplicación automatizada de tres instrumentos pedagógicos: **Kolb, CHAEA y VAK**. Diseñada para apoyar la implementación del Diseño Universal para el Aprendizaje (DUA).

## 🚀 Características
- **Multi-Instrumento**: Evaluación secuencial de estilos de aprendizaje.
- **Persistencia en la Nube**: Conexión con Google Sheets para almacenar resultados.
- **Notificaciones**: Envío automático de resultados al correo del aprendiz.
- **Validación de Usuarios**: Evita duplicidad verificando si el aprendiz ya presentó la prueba.
- **Interfaz Moderna**: Diseño responsivo y amigable construido con Tailwind CSS.

## 📋 Instrumentos
1.  **Kolb**: Identifica el estilo de procesamiento de información (Divergente, Asimilador, Convergente, Acomodador).
2.  **CHAEA**: Mide preferencias de aprendizaje (Activo, Reflexivo, Teórico, Pragmático).
3.  **VAK**: Determina el canal sensorial predominante (Visual, Auditivo, Kinestésico).

## 🛠️ Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/sena-characterization-tool.git
cd sena-characterization-tool
```

### 2. Configurar el Backend (Google Apps Script)
Para que el guardado de datos funcione, necesitas tu propio script de Google:
1.  Ve a [Google Sheets](https://sheets.google.com) y crea una nueva hoja.
2.  Ve a **Extensiones > Apps Script**.
3.  Copia el contenido del archivo `server.gs` de este repositorio y pégalo en el editor de Apps Script.
4.  Guarda el proyecto.
5.  Haz clic en **Implementar > Nueva implementación**.
    *   **Tipo:** Aplicación web.
    *   **Ejecutar como:** Yo (tu correo).
    *   **Quién tiene acceso:** Cualquier persona (Anyone).
6.  Copia la **URL de la aplicación web** generada.

### 3. Conectar Frontend y Backend
1.  Abre el archivo `main.js`.
2.  Busca la constante `GAS_URL` en la línea 6 (aprox).
3.  Reemplaza el valor con tu URL generada en el paso anterior.
    ```javascript
    const GAS_URL = 'https://script.google.com/macros/s/TUS_CREDENCIALES/exec';
    ```

### 4. Ejecutar Localmente
Simplemente abre el archivo `index.html` en tu navegador o usa una extensión como "Live Server" en VS Code.

## 📂 Estructura del Proyecto
*   `index.html`: Contenedor principal de la aplicación.
*   `main.js`: Lógica de negocio, manejo de estado y renderizado de vistas.
*   `questions.json`: Banco de preguntas y lógica de puntuación.
*   `server.gs`: Código del lado del servidor para Google Apps Script.
*   `CONTEXT.md`: Documentación técnica para agentes de IA.

## 🤝 Contribución
Este proyecto es de código abierto. Si deseas contribuir:
1.  Haz un Fork del repositorio.
2.  Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`).
3.  Haz Commit de tus cambios.
4.  Haz Push a la rama.
5.  Abre un Pull Request.

## 📄 Licencia
Este proyecto es de uso libre para fines educativos dentro del ecosistema SENA.