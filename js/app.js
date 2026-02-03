/**
 * @module App
 * @description Controlador principal de la aplicación.
 * Orquesta la lógica entre Estado, Vistas y Servicios.
 * Se expone globalmente como 'window.App' para manejar eventos del DOM (onclick, onsubmit).
 */

import State from './state.js';
import Services from './services.js';
import { Utils } from './utils.js';

// Importación de Vistas
import { welcomeView } from './views/welcome.js';
import { registerView } from './views/register.js';
import { kolbView } from './views/kolb.js';
import { chaeaView } from './views/chaea.js';
import { vakView } from './views/vak.js';
import { resultsView } from './views/results.js';
import { guideView } from './views/guide.js';

const App = {
    // Referencias al DOM
    dom: {
        app: null,
        headerUser: null
    },

    /**
     * @function init
     * @description Punto de entrada. Carga preguntas y estado previo.
     */
    async init() {
        this.dom.app = document.getElementById('app');
        this.dom.headerUser = document.getElementById('headerUser');

        // Intenta cargar estado previo
        if (State.load()) {
            console.log("Estado restaurado:", State.data.currentView);
        }

        // Update Footer Year
        const footerYear = document.getElementById('footer-year');
        if (footerYear) footerYear.textContent = new Date().getFullYear();

        try {
            await this.loadQuestions();
            this.render();
            // Escuchar cambios en hash o botones atrás podría ir aquí
        } catch (error) {
            this.showError("Error inicializando la aplicación: " + error.message);
        }
    },

    /**
     * @function loadQuestions
     * @description Carga el archivo JSON de preguntas.
     */
    async loadQuestions() {
        if (State.data.questions) return; // Ya cargadas
        const response = await fetch('questions.json');
        if (!response.ok) throw new Error("No se pudo cargar questions.json");
        State.setQuestions(await response.json());
    },

    /**
     * @function render
     * @description Renderiza la vista actual basada en State.data.currentView.
     * @param {boolean} scrollToTop - Si es true, hace scroll al inicio (útil en navegación).
     */
    render(scrollToTop = true) {
        this.updateHeaderUser();
        this.updateWizard(State.data.currentView);

        const views = {
            'welcome': () => welcomeView(),
            'register': () => registerView(),
            'form_kolb': () => kolbView(State.data.questions.kolb, State.data.answers.kolb, State.data.userProfile),
            'form_chaea': () => chaeaView(State.data.questions.chaea, State.data.answers.chaea, State.data.chaeaPage),
            'form_vak': () => vakView(State.data.questions.vak, State.data.answers.vak),
            'results': () => {
                // Asegurar cálculos antes de mostrar
                this.calculateResults();
                return resultsView(State.data);
            },
            'guide': () => guideView(State.data.isExistingUser, State.data.isSaved)
        };

        const viewFn = views[State.data.currentView];
        if (viewFn) {
            this.dom.app.innerHTML = viewFn();
            if (scrollToTop) window.scrollTo(0, 0);
        } else {
            this.dom.app.innerHTML = welcomeView();
        }
    },

    /**
     * @function navigate
     * @description Cambia la vista actual y guarda el estado.
     * @param {string} view - Nombre de la vista destino.
     */
    navigate(view) {
        State.data.currentView = view;
        State.save();
        this.render(true);
    },

    // ===================================
    // LÓGICA DE USUARIO Y REGISTRO
    // ===================================

    updateHeaderUser() {
        const p = State.data.userProfile;
        if (p && p.nombre) {
            this.dom.headerUser.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="text-right hidden md:block">
                        <div class="text-xs text-gray-400 font-bold uppercase tracking-wider">Aprendiz</div>
                        <div class="text-sm font-bold text-gray-300">${p.nombre} ${p.apellidos}</div>
                    </div>
                    <div class="w-10 h-10 bg-gradient-to-br from-sena-green to-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-green-900/20 border border-white/10">
                        ${p.nombre.charAt(0)}
                    </div>
                </div>
                <button onclick="App.resetProgress()" class="text-xs text-red-400 hover:text-red-300 underline ml-4">Reiniciar</button>
            `;
        } else {
            this.dom.headerUser.innerHTML = '';
        }
    },

    resetProgress() {
        State.reset();
    },

    async handleRegister(e) {
        e.preventDefault();
        const fd = new FormData(e.target);
        const data = Object.fromEntries(fd);

        // UI Feedback
        const btn = document.getElementById('btnReg');
        const status = document.getElementById('regStatus');
        const originalText = btn.innerHTML;

        btn.disabled = true;
        btn.innerHTML = `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Verificando...`;

        try {
            // Verificar usuario en backend
            const response = await Services.checkUser(data.documento);

            if (response.status === 'found') {
                // Usuario existe: Hidratar datos y saltar a resultados
                this.hydrateResultsFromServer(response.data);
                State.data.isExistingUser = true;
                State.data.userProfile = data; // Actualizar con info fresca del form
                status.innerText = "Usuario encontrado. Cargando resultados...";
                this.calculateResults(); // Recalcular perfiles
                setTimeout(() => this.navigate('results'), 1000);
            } else {
                // Usuario nuevo
                State.data.userProfile = data;
                State.data.isExistingUser = false;
                this.navigate('form_kolb');
            }
        } catch (error) {
            console.error(error);
            // En caso de error de red, permitimos continuar offline/localmente como nuevo
            if (confirm("No se pudo conectar con el servidor. ¿Deseas continuar en modo offline? (Los resultados se guardarán localmente hasta que vuelva la conexión)")) {
                State.data.userProfile = data;
                State.data.isExistingUser = false;
                this.navigate('form_kolb');
            } else {
                status.innerHTML = `<span class="text-red-500">Error de conexión. Intente nuevamente.</span>`;
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        }
    },

    hydrateResultsFromServer(data) {
        // Restauramos estructura plana del Excel a estructura anidada de State
        State.data.scores = {
            kolb: {
                profile: { name: "", description: "" }, // Se recalculará
                x: Number(data.Kolb_X),
                y: Number(data.Kolb_Y)
            },
            chaea: {
                Activo: Number(data.CHAEA_Activo),
                Reflexivo: Number(data.CHAEA_Reflexivo),
                Teórico: Number(data.CHAEA_Teorico),
                Pragmático: Number(data.CHAEA_Pragmatico)
            },
            vak: {
                Visual: Number(data.VAK_Visual),
                Auditivo: Number(data.VAK_Auditivo),
                Kinestesico: Number(data.VAK_Kinestesico)
            }
        };
        // Nota: Los perfiles se recalculan en calculateResults() basado en estos scores numéricos
    },

    // ===================================
    // INPUT HANDLERS (Views calls these)
    // ===================================

    handleKolbInput(qid, style, val) {
        if (!State.data.answers.kolb[qid]) State.data.answers.kolb[qid] = {};

        // Lógica de unicidad (radio group horizontal)
        const row = State.data.answers.kolb[qid];
        Object.keys(row).forEach(s => {
            if (row[s] === val && s !== style) delete row[s];
        });

        State.data.answers.kolb[qid][style] = val;
        State.save();
        this.render(false); // Re-render para actualizar UI de botones
    },

    handleChaeaInput(id, val) {
        State.data.answers.chaea[id] = val;
        State.save();
        this.render(false); // No scroll, solo actualizar toggle
    },

    nextChaeaPage() {
        // Validar página actual antes de avanzar
        const page = State.data.chaeaPage;
        const qPerPage = 20;
        const currentQ = State.data.questions.chaea.questions.slice(page * qPerPage, (page + 1) * qPerPage);

        const missing = currentQ.filter(q => State.data.answers.chaea[q.id] === undefined);

        if (missing.length > 0) {
            alert(`Por favor contesta todas las preguntas de este bloque.`);
            return;
        }

        State.data.chaeaPage++;
        State.save();
        this.render(true); // Renderiza la nueva página del form (Sí scroll)
    },

    prevChaeaPage() {
        if (State.data.chaeaPage > 0) {
            State.data.chaeaPage--;
            State.save();
            this.render(true); // Sí scroll al cambiar de página
        }
    },

    handleVakInput(qid, style) {
        // VAK almacena el string del estilo ('visual', etc.)
        State.data.answers.vak[qid] = style;
        State.save();
        this.render(false); // No scroll
    },

    // ===================================
    // VALIDACIÓN Y NAVEGACIÓN
    // ===================================

    validateAndNext(currentSection, nextView) {
        let isValid = true;

        if (currentSection === 'kolb') {
            const questions = State.data.questions.kolb.questions;
            for (let q of questions) {
                // Verificar que tenga 4 respuestas y sean 1,2,3,4 únicos
                const row = State.data.answers.kolb[q.id] || {};
                const values = Object.values(row);
                if (values.length < 4) {
                    isValid = false;
                    alert(`Fila ${q.id} incompleta. Debes asignar 1, 2, 3 y 4.`);
                    break;
                }
            }
        }
        else if (currentSection === 'chaea') {
            // Se valida por bloque en nextChaeaPage, pero aquí validamos todo al final
            const totalQ = State.data.questions.chaea.questions.length; // 80
            const answered = Object.keys(State.data.answers.chaea).length;
            if (answered < totalQ) {
                isValid = false;
                alert(`Faltan preguntas por responder. (Respondidas: ${answered}/${totalQ})`);
            }
        }
        else if (currentSection === 'vak') {
            const totalQ = State.data.questions.vak.questions.length;
            const answered = Object.keys(State.data.answers.vak).length;
            if (answered < totalQ) {
                isValid = false;
                alert("Por favor responde todas las preguntas VAK.");
            }
        }

        if (isValid) {
            if (nextView === 'results') {
                this.calculateResults();
                this.finishAndSave(); // Auto-save trigger
            }
            this.navigate(nextView);
        }
    },

    // ===================================
    // CÁLCULOS Y GUARDADO
    // ===================================

    calculateResults() {
        // Si ya existen scores completos (hidratados o calculados), usamos esos
        // PERO: Si venimos de responder questions, hay que recalcular.
        // La lógica de Utils.calculateScores maneja esto.

        // Si es usuario existente Y ya tiene perfil, quizás no deberíamos recalcular para no sobrescribir manualidades
        // Pero en este flujo, asumimos que siempre recalculamos basado en lo que hay en State (Answers o Scores previos).

        // Caso especial: Si fue hidratado, scores ya tiene valores X/Y, pero quizas falte Profile objects.
        // Vamos a usar una lógica híbrida:
        // Si hay respuestas, calculamos desde respuestas.
        if (Object.keys(State.data.answers.kolb).length > 0) {
            State.data.scores = Utils.calculateScores(State.data.answers);
        } else if (State.data.isExistingUser && State.data.scores.kolb) {
            // Re-hidratar profiles desde números (por si acaso)
            const s = State.data.scores;
            s.kolb.profile = Utils.calculateKolbProfile(s.kolb.x, s.kolb.y);
            s.chaea.profile = Utils.findDominant(s.chaea);
            s.vak.profile = Utils.findDominant(s.vak);
            State.data.scores = s;
        }

        State.save();
    },

    async finishAndSave() {
        // Evitamos guardar duplicados si ya se guardó
        if (State.data.isSaved || State.data.isExistingUser) return;

        State.data.isSaving = true;
        this.render(); // Muestra banner "Guardando..."

        try {
            await Services.saveResults(State.data);

            State.data.isSaving = false;
            State.data.isSaved = true;
            State.data.saveError = false;
            State.save();
            this.render(); // Muestra banner "Éxito"

        } catch (error) {
            console.error("Fallo guardado auto:", error);
            State.data.isSaving = false;
            State.data.saveError = true;
            State.save();
            this.render(); // Muestra banner "Error"
        }
    },

    // Wrapper público para reintentar guardado manual
    saveToGoogleSheets() {
        this.finishAndSave();
    },

    // ===================================
    // UI UTILS
    // ===================================

    updateWizard(view) {
        // Lógica visual de los pasos 1-2-3 (Opcional, si el navbar tuviera wizard steps)
        // Por ahora solo actualiza el DOM si existieran elementos de wizard
    },

    showError(msg) {
        alert(msg);
    }
};

// Exponer globalmente
window.App = App;

// Auto-iniciar al cargar
document.addEventListener('DOMContentLoaded', () => App.init());

export default App;
