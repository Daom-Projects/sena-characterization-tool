/**
 * @module State
 * @description Módulo encargado de gestionar el estado global de la aplicación.
 * Implementa el patrón "Single Source of Truth" (Fuente Única de Verdad).
 * Maneja la persistencia en LocalStorage para no perder datos al recargar.
 */

const STORAGE_KEY = 'sena_char_state';

const State = {
    // Estado inicial por defecto
    data: {
        currentView: 'welcome',
        questions: null,        // Se cargará desde questions.json
        answers: {              // Almacena las respuestas del usuario
            kolb: {},           // { questionId: { style: value } }
            chaea: {},          // { questionId: value }
            vak: {}             // { questionId: value }
        },
        userProfile: {},        // Datos del aprendiz (Nombre, Ficha, Documento)
        scores: {},             // Resultados procesados
        isExistingUser: false,  // Si true, es una consulta de un usuario antiguo
        chaeaPage: 0,           // Paginación para el test CHAEA
        isSaving: false,        // Estado de carga (Guardando...)
        isSaved: false,         // Estado de éxito
        saveError: false        // Estado de error
    },

    /**
     * @function load
     * @description Intenta recuperar el estado guardado en el navegador.
     * @returns {boolean} True si se cargaron datos previos, False si es una sesión nueva.
     */
    load() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return false;
        try {
            const saved = JSON.parse(raw);
            // Fusionamos el estado guardado con la estructura base para evitar undefined
            this.data = { ...this.data, ...saved };
            // Restauramos banderas temporales a falso por seguridad
            this.data.isSaving = false;
            return true;
        } catch (e) {
            console.error("Error cargando estado:", e);
            return false;
        }
    },

    /**
     * @function save
     * @description Guarda el estado actual en LocalStorage.
     * Se debe llamar cada vez que el usuario modifica un dato importante.
     */
    save() {
        // Añadimos un timestamp para control de versiones si fuera necesario en el futuro
        const toSave = { ...this.data, timestamp: Date.now() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    },

    /**
     * @function reset
     * @description Borra todo el progreso y recarga la página.
     * Útil para empezar una nueva caracterización desde cero.
     */
    reset() {
        if (confirm("¿Estás seguro de reiniciar todo el formulario? Se perderá el avance actual.")) {
            localStorage.removeItem(STORAGE_KEY);
            location.reload();
        }
    },

    /**
     * @function setQuestions
     * @description Setter para guardar el banco de preguntas cargado.
     */
    setQuestions(questions) {
        this.data.questions = questions;
    }
};

export default State;
