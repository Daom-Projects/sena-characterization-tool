/**
 * SENA Characterization Tool - Main Application Logic
 * Supports: Registration, Kolb, CHAEA, VAK instruments.
 */

const GAS_URL = 'https://script.google.com/macros/s/AKfycbySr2oaxfVZmdwKC96qQwXtjpcVXxi4hqPhgbXOEVqa7cXmrUMK5RIBn9FLFhsZkj2n/exec';

const App = {
    state: {
        currentView: 'welcome',
        questions: null,
        answers: { kolb: {}, chaea: {}, vak: {} },
        userProfile: {}, // Stores registration data
        scores: {},
        isExistingUser: false,
        chaeaPage: 0 // Pagination for CHAEA
    },

    async init() {
        console.log('App Initializing...');
        this.cacheDOM();

        // Load saved state first
        if (this.loadState()) {
            console.log("State restored");
        }

        await this.loadQuestions();

        // Dynamic Year
        const currentYear = new Date().getFullYear();
        const yearSpan = document.getElementById('footer-year');
        if (yearSpan) yearSpan.textContent = currentYear;
        document.title = `SENA - Caracterización Integral ${currentYear}`;

        // If state was loaded, maybe navigate to where we were?
        // But render() handles checking currentView
        this.render();
    },

    cacheDOM() {
        this.dom = {
            app: document.getElementById('app')
        };
    },

    async loadQuestions() {
        try {
            const response = await fetch('questions.json');
            if (!response.ok) throw new Error('Failed to load questions');
            this.state.questions = await response.json();
            console.log('Questions loaded');
        } catch (error) {
            this.showError('No se pudieron cargar los instrumentos. Usa Live Server.');
        }
    },

    // =========================================================================
    // PERSISTENCE
    // =========================================================================
    saveState() {
        const data = {
            answers: this.state.answers,
            scores: this.state.scores,
            currentView: this.state.currentView,
            userProfile: this.state.userProfile,
            isExistingUser: this.state.isExistingUser,
            chaeaPage: this.state.chaeaPage,
            timestamp: Date.now()
        };
        localStorage.setItem('sena_char_state', JSON.stringify(data));
    },

    loadState() {
        const raw = localStorage.getItem('sena_char_state');
        if (!raw) return false;
        try {
            const data = JSON.parse(raw);
            this.state.answers = data.answers || { kolb: {}, chaea: {}, vak: {} };
            this.state.scores = data.scores || { kolb: {}, chaea: {}, vak: {} };
            this.state.currentView = data.currentView || 'welcome';
            this.state.userProfile = data.userProfile || {};
            this.state.isExistingUser = !!data.isExistingUser;
            this.state.chaeaPage = data.chaeaPage || 0;
            return true;
        } catch (e) {
            console.error("State load error", e);
            return false;
        }
    },

    resetProgress() {
        if (confirm("¿Estás seguro de reiniciar todo el formulario? Se perderá el avance actual.")) {
            localStorage.removeItem('sena_char_state');
            location.reload();
        }
    },

    updateHeaderUser() {
        const nameSpan = document.getElementById('header-username');
        const infoDiv = document.getElementById('user-progress-info');
        const resetBtn = document.getElementById('btn-reset');

        if (this.state.userProfile.nombre && nameSpan && infoDiv) {
            nameSpan.textContent = `${this.state.userProfile.nombre} ${this.state.userProfile.apellidos || ''}`;
            infoDiv.classList.remove('hidden');
            if (resetBtn) resetBtn.classList.remove('hidden');
        } else {
            if (infoDiv) infoDiv.classList.add('hidden');
            if (resetBtn) resetBtn.classList.add('hidden');
        }
    },

    navigate(view) {
        this.state.currentView = view;
        this.saveState();
        this.render();
        this.updateWizard(view);
        this.updateHeaderUser();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    updateWizard(view) {
        const steps = ['step-1', 'step-2', 'step-3'];
        const activeColor = 'bg-sena-green';
        const inactiveColor = 'bg-gray-200';

        // Reset
        steps.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.className = `h-2 w-8 rounded-full transition-all duration-500 cursor-help ${inactiveColor}`;
            }
        });

        // Set Active state based on view
        if (view.includes('kolb')) {
            document.getElementById('step-1').className = `h-2 w-8 rounded-full transition-all duration-500 cursor-help ${activeColor} shadow-lg shadow-green-200`;
        } else if (view.includes('chaea')) {
            document.getElementById('step-1').className = `h-2 w-8 rounded-full transition-all duration-500 cursor-help ${activeColor}`;
            document.getElementById('step-2').className = `h-2 w-8 rounded-full transition-all duration-500 cursor-help ${activeColor} shadow-lg shadow-green-200`;
        } else if (view.includes('vak') || view === 'results') {
            steps.forEach(id => document.getElementById(id).className = `h-2 w-8 rounded-full transition-all duration-500 cursor-help ${activeColor}`);
        }
    },

    render() {
        const { currentView } = this.state;
        const app = this.dom.app;

        // Animate transition (simple)
        app.classList.remove('view-transition');
        void app.offsetWidth; // trigger reflow
        app.classList.add('view-transition');

        switch (currentView) {
            case 'welcome': app.innerHTML = this.views.welcome(); break;
            case 'register': this.renderRegister(); break;
            case 'form_kolb': this.renderKolb(); break;
            case 'form_chaea': this.renderChaea(); break;
            case 'form_vak': this.renderVak(); break;
            case 'results':
                this.calculateResults();
                app.innerHTML = this.views.results();
                break;
            default: app.innerHTML = this.views.welcome();
        }

        // Ensure header is updated on every render
        this.updateHeaderUser();
    },

    showError(msg) {
        this.dom.app.innerHTML = `<div class="p-6 text-red-700 bg-red-100 rounded-xl border border-red-200 shadow-sm">
            <strong class="font-bold">Error:</strong> ${msg}
        </div>`;
    },

    // =========================================================================
    // REGISTRATION & USER CHECK
    // =========================================================================
    renderRegister() {
        this.dom.app.innerHTML = `
            <div class="max-w-2xl mx-auto glass-card p-10 rounded-3xl shadow-2xl animate-fade-in-up relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sena-green to-teal-600"></div>
                
                <h2 class="text-4xl font-black text-center text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-600 mb-2">Datos del Aprendiz</h2>
                <p class="text-gray-500 text-center mb-10 text-lg">Inicia tu ruta de aprendizaje personalizada</p>
                
                <form id="regForm" onsubmit="App.handleRegister(event)" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="group">
                            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 group-focus-within:text-sena-green transition-colors">Nombre</label>
                            <input type="text" name="nombre" required class="w-full bg-gray-50 border-transparent focus:bg-white focus:border-b-2 focus:border-sena-green focus:ring-0 rounded-lg py-3 px-4 transition-all shadow-inner font-medium text-gray-700 placeholder-gray-300">
                        </div>
                        <div class="group">
                            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 group-focus-within:text-sena-green transition-colors">Apellidos</label>
                            <input type="text" name="apellidos" required class="w-full bg-gray-50 border-transparent focus:bg-white focus:border-b-2 focus:border-sena-green focus:ring-0 rounded-lg py-3 px-4 transition-all shadow-inner font-medium text-gray-700">
                        </div>
                    </div>
                    
                    <div class="group">
                        <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 group-focus-within:text-sena-green transition-colors">Documento de Identidad</label>
                        <input type="number" name="documento" required class="w-full bg-gray-50 border-transparent focus:bg-white focus:border-b-2 focus:border-sena-green focus:ring-0 rounded-lg py-3 px-4 transition-all shadow-inner font-medium text-gray-700" placeholder="Sin puntos ni espacios">
                    </div>

                    <div class="group">
                        <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 group-focus-within:text-sena-green transition-colors">Correo Electrónico</label>
                        <input type="email" name="email" required class="w-full bg-gray-50 border-transparent focus:bg-white focus:border-b-2 focus:border-sena-green focus:ring-0 rounded-lg py-3 px-4 transition-all shadow-inner font-medium text-gray-700">
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="group">
                            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 group-focus-within:text-sena-green transition-colors">Programa de Formación</label>
                            <input type="text" name="programa" required class="w-full bg-gray-50 border-transparent focus:bg-white focus:border-b-2 focus:border-sena-green focus:ring-0 rounded-lg py-3 px-4 transition-all shadow-inner font-medium text-gray-700">
                        </div>
                        <div class="group">
                            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 group-focus-within:text-sena-green transition-colors">Ficha (ID)</label>
                            <input type="text" name="ficha" required class="w-full bg-gray-50 border-transparent focus:bg-white focus:border-b-2 focus:border-sena-green focus:ring-0 rounded-lg py-3 px-4 transition-all shadow-inner font-medium text-gray-700">
                        </div>
                    </div>

                    <div class="pt-6">
                        <button type="submit" id="btnReg" class="w-full bg-gradient-to-r from-sena-green to-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-[1.02] transition-all duration-300 transform active:scale-95 text-lg tracking-wide uppercase">
                            Continuar
                        </button>
                        <div id="regStatus" class="mt-4 text-center text-sm text-gray-500 font-medium"></div>
                    </div>
                </form>
            </div>
        `;
    },

    async handleRegister(e) {
        e.preventDefault();
        const f = e.target;
        const p = {
            nombre: f.nombre.value,
            apellidos: f.apellidos.value,
            documento: f.documento.value,
            email: f.email.value,
            programa: f.programa.value,
            ficha: f.ficha.value
        };

        const btn = document.getElementById('btnReg');
        const st = document.getElementById('regStatus');
        btn.disabled = true;
        btn.innerText = 'Verificando...';

        try {
            this.state.userProfile = p;
            this.updateHeaderUser();
            this.saveState(); // Save basic profile

            const isLocal = GAS_URL.includes('ExamplePlaceholder') || window.location.hostname === '127.0.0.1';

            if (isLocal) {
                // Try check but fallback if fails
            }

            // Check logic... 
            await this.checkUser(p.documento);

        } catch (err) {
            console.error(err);
            // If fetch failed (CORS/Network), just proceed for now so user isn't blocked (Offline mode)
            st.innerHTML = `<span class="text-amber-600">Modo Offline/Local: No se pudo verificar antecedentes. Continuando...</span>`;
            setTimeout(() => this.navigate('form_kolb'), 2000);
        }
    },

    async checkUser(id) {
        try {
            // Check for placeholder URL
            if (GAS_URL.includes('ExamplePlaceholder')) {
                throw new Error("Local Mode (Placeholder URL)");
            }

            const res = await fetch(GAS_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'check', documento: id })
            });
            const json = await res.json();

            if (json.status === 'found') {
                if (confirm(`Hola ${json.data.Nombre}, ya hemos encontrado resultados tuyos del ${new Date(json.data.Fecha).toLocaleDateString()}. ¿Deseas verlos?`)) {
                    this.hydrateResultsFromServer(json.data);
                    this.state.isExistingUser = true;
                    this.navigate('results');
                } else {
                    if (!confirm("¿Deseas presentar la prueba nuevamente? Esto guardará un nuevo registro.")) {
                        document.getElementById('btnReg').disabled = false;
                        document.getElementById('btnReg').innerText = 'CONTINUAR';
                        return;
                    }
                    this.navigate('form_kolb');
                }
            } else {
                this.navigate('form_kolb');
            }
        } catch (e) {
            console.warn("CheckUser failed/skipped:", e);
            // Fallback for local/offline: just proceed
            this.navigate('form_kolb');
        }
    },

    hydrateResultsFromServer(data) {
        this.state.scores = {
            kolb: {
                profile: { name: data.Resultado_Kolb, description: "Recuperado de bdd" },
                x: data.Kolb_X,
                y: data.Kolb_Y
            },
            chaea: {
                Activo: data.CHAEA_Activo,
                Reflexivo: data.CHAEA_Reflexivo,
                Teórico: data.CHAEA_Teorico,
                Pragmático: data.CHAEA_Pragmatico
            },
            vak: {
                Visual: data.VAK_Visual,
                Auditivo: data.VAK_Auditivo,
                Kinestesico: data.VAK_Kinestesico
            }
        };
    },

    // =========================================================================
    // RENDERERS (Kolb, CHAEA, VAK)
    // =========================================================================
    renderKolb() {
        const data = this.state.questions.kolb;
        let html = `
            <div class="max-w-5xl mx-auto animate-fade-in-up">
                <div class="mb-10 text-center">
                    <span class="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Fase 1 de 3</span>
                    <h2 class="text-4xl font-black text-gray-900 mt-4 mb-2">${data.title}</h2>
                    <p class="text-gray-500 max-w-2xl mx-auto">Aprendiz: <span class="font-bold text-gray-800">${this.state.userProfile.nombre || 'Invitado'}</span></p>
                </div>

                <div class="glass-card p-6 rounded-2xl border-l-8 border-sena-green mb-10 shadow-lg flex items-start gap-4">
                    <div class="bg-green-100 p-3 rounded-full shrink-0 text-sena-green">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div>
                        <h3 class="font-bold text-gray-900 text-lg mb-1">Instrucciones</h3>
                        <p class="text-gray-600 leading-relaxed">${data.instructions} <br/><span class="text-xs text-gray-400 mt-2 block">(1 = Menos me describe, 4 = Más me describe. No repetir números en la misma fila)</span></p>
                    </div>
                </div>

                <div class="space-y-8">
        `;

        data.questions.forEach((q) => {
            html += `
                <div class="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 relative overflow-hidden group">
                    <div class="absolute top-0 right-0 bg-gray-50 text-gray-300 font-black text-9xl opacity-20 -mr-6 -mt-6 select-none group-hover:text-sena-green/10 transition-colors">${q.id}</div>
                    
                    <div class="flex items-center mb-8 relative z-10">
                        <span class="bg-gray-900 text-white rounded-2xl w-12 h-12 flex items-center justify-center font-bold text-xl mr-4 shadow-lg shadow-gray-500/30">${q.id}</span>
                        <h3 class="text-xl font-bold text-gray-800">Evaluación de Preferencias</h3>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
            `;
            q.options.forEach(opt => {
                const currentVal = this.state.answers.kolb[q.id]?.[opt.style] || '';
                html += `
                    <div class="flex flex-col bg-gray-50 p-4 rounded-2xl border border-transparent hover:border-gray-200 transition-colors group/input focus-within:bg-white focus-within:shadow-md focus-within:border-sena-green/50">
                        <label class="mb-3 text-sm font-medium text-gray-600 leading-snug min-h-[40px]" title="${opt.text}">${opt.text}</label>
                        <div class="relative">
                            <input type="number" min="1" max="4" 
                                class="w-full text-center font-bold text-lg border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-sena-green focus:border-transparent py-3 shadow-sm transition-all"
                                placeholder="-"
                                data-qid="${q.id}" data-style="${opt.style}"
                                value="${currentVal}"
                                onchange="App.handleKolbInput(this)">
                             <div class="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-300 pointer-events-none font-bold">1-4</div>
                        </div>
                    </div>
                `;
            });
            html += `</div></div>`;
        });

        html += `
            <div class="flex justify-between items-center py-12">
                <button onclick="App.navigate('register')" class="text-gray-500 hover:text-gray-900 font-medium px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors">
                    &larr; Volver
                </button>
                <button onclick="App.validateAndNext('kolb', 'form_chaea')" class="bg-gray-900 text-white font-bold py-4 px-12 rounded-2xl shadow-xl hover:shadow-2xl hover:bg-black hover:-translate-y-1 transition-all duration-300 flex items-center gap-2">
                    Continuar a CHAEA
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
            </div></div>
        `;
        this.dom.app.innerHTML = html;
    },

    handleKolbInput(input) {
        const qid = input.dataset.qid;
        const style = input.dataset.style;
        const val = parseInt(input.value);
        if (!this.state.answers.kolb[qid]) this.state.answers.kolb[qid] = {};
        this.state.answers.kolb[qid][style] = val;
        this.saveState();
    },

    renderChaea() {
        const data = this.state.questions.chaea;
        const page = this.state.chaeaPage;
        const QUESTIONS_PER_PAGE = 20;
        const start = page * QUESTIONS_PER_PAGE;
        const end = start + QUESTIONS_PER_PAGE;

        const currentQuestions = data.questions.slice(start, end);
        const totalPages = Math.ceil(data.questions.length / QUESTIONS_PER_PAGE);
        const progress = Math.round(((page + 1) / totalPages) * 100);

        let html = `
            <div class="max-w-4xl mx-auto animate-fade-in-up">
                <div class="mb-8 text-center">
                    <span class="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Fase 2 de 3</span>
                    <h2 class="text-4xl font-black text-gray-900 mt-4 mb-2">${data.title}</h2>
                    <p class="text-gray-500 max-w-2xl mx-auto py-2">${data.instructions}</p>
                    <div class="mt-4 flex flex-col items-center">
                         <span class="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Bloque ${page + 1} de ${totalPages}</span>
                         <div class="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div class="h-full bg-purple-600 transition-all duration-500" style="width: ${progress}%"></div>
                         </div>
                    </div>
                </div>

                <div class="space-y-4">
        `;

        currentQuestions.forEach(q => {
            const val = this.state.answers.chaea[q.id];
            const yesClass = val === 1 ? 'bg-sena-green text-white shadow-lg scale-105 border-transparent' : 'bg-white text-gray-500 border-gray-200 hover:border-sena-green hover:text-sena-green';
            const noClass = val === 0 ? 'bg-red-500 text-white shadow-lg scale-105 border-transparent' : 'bg-white text-gray-500 border-gray-200 hover:border-red-500 hover:text-red-500';

            html += `
                <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
                    <div class="flex-1 pr-6 flex items-start gap-3">
                        <span class="text-xs font-bold bg-gray-100 text-gray-500 py-1 px-2 rounded-lg mt-1 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">${q.id}</span>
                        <p class="text-gray-700 font-medium text-lg leading-snug">${q.text}</p>
                    </div>
                    <div class="flex gap-3 shrink-0">
                        <button onclick="App.handleChaeaInput(${q.id}, 1)" class="w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${yesClass}" title="De acuerdo">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        </button>
                        <button onclick="App.handleChaeaInput(${q.id}, 0)" class="w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${noClass}" title="En desacuerdo">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                </div>
            `;
        });

        const isLastPage = page === totalPages - 1;
        const nextAction = isLastPage ? "App.validateAndNext('chaea', 'form_vak')" : "App.nextChaeaPage()";
        const nextLabel = isLastPage ? "Finalizar Bloque y Continuar" : "Siguiente Bloque";

        html += `
            <div class="flex justify-between items-center py-12">
                <button onclick="${page === 0 ? "App.navigate('form_kolb')" : "App.prevChaeaPage()"}" class="text-gray-500 hover:text-gray-900 font-medium px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors">
                    &larr; Anterior
                </button>
                <button onclick="${nextAction}" class="bg-gray-900 text-white font-bold py-4 px-12 rounded-2xl shadow-xl hover:shadow-2xl hover:bg-black hover:-translate-y-1 transition-all duration-300 flex items-center gap-2">
                    ${nextLabel}
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
            </div></div>
        `;
        this.dom.app.innerHTML = html;
    },

    handleChaeaInput(id, val) {
        this.state.answers.chaea[id] = val;
        this.saveState();
        this.renderChaea();
    },

    nextChaeaPage() {
        const currentQ = this.state.questions.chaea.questions.slice(this.state.chaeaPage * 20, (this.state.chaeaPage + 1) * 20);
        const missing = [];
        currentQ.forEach(q => {
            if (this.state.answers.chaea[q.id] === undefined) missing.push(q.id);
        });

        if (missing.length > 0) {
            alert(`Por favor responda las preguntas: ${missing.join(', ')}`);
            return;
        }

        this.state.chaeaPage++;
        this.saveState();
        this.navigate('form_chaea');
    },

    prevChaeaPage() {
        if (this.state.chaeaPage > 0) {
            this.state.chaeaPage--;
            this.saveState();
            this.navigate('form_chaea');
        }
    },

    renderVak() {
        const data = this.state.questions.vak;
        let html = `
            <div class="max-w-4xl mx-auto animate-fade-in-up">
                <div class="mb-10 text-center">
                    <span class="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Fase Final</span>
                    <h2 class="text-4xl font-black text-gray-900 mt-4 mb-2">${data.title}</h2>
                    <p class="text-gray-500 max-w-2xl mx-auto">${data.description}</p>
                </div>

                <div class="space-y-8">
        `;
        data.questions.forEach(q => {
            const currentVal = this.state.answers.vak[q.id];
            html += `
                <div class="glass-card p-8 rounded-3xl shadow-lg border border-gray-100">
                    <h3 class="font-bold text-gray-800 mb-6 flex items-start gap-4">
                        <span class="bg-indigo-600 text-white rounded-xl w-10 h-10 flex items-center justify-center font-bold text-lg shrink-0 shadow-lg shadow-indigo-500/30">${q.id}</span> 
                        <span class="pt-1 text-xl">${q.text}</span>
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            `;
            q.options.forEach(opt => {
                const isChecked = currentVal === opt.style;
                const activeStyle = isChecked
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30 scale-[1.02] border-indigo-600 ring-2 ring-indigo-300'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50';

                const circleStyle = isChecked
                    ? 'border-white bg-white text-indigo-600'
                    : 'border-gray-300 bg-transparent';

                html += `
                    <label class="flex flex-col p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 relative group overflow-hidden ${activeStyle}" onmousedown="this.classList.add('scale-95')" onmouseup="this.classList.remove('scale-95')">
                        <input type="radio" name="vak_${q.id}" ${isChecked ? 'checked' : ''} onclick="App.handleVakInput(${q.id}, '${opt.style}')" class="hidden">
                        
                        <div class="flex items-center gap-3 mb-2">
                            <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${circleStyle}">
                                ${isChecked ? '<div class="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>' : ''}
                            </div>
                            <span class="text-xs font-bold uppercase tracking-wider opacity-70">${opt.style}</span>
                        </div>
                        
                        <span class="text-sm font-medium leading-relaxed z-10">${opt.label}</span>
                        
                        <!-- Decoration -->
                        ${isChecked ? '<div class="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>' : ''}
                    </label>
                `;
            });
            html += `</div></div>`;
        });
        html += `
            <div class="flex justify-between items-center py-12">
                <button onclick="App.navigate('form_chaea')" class="text-gray-500 hover:text-gray-900 font-medium px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors">
                    &larr; Volver
                </button>
                <button onclick="App.validateAndNext('vak', 'results')" class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-12 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-pulse">
                    Finalizar y Ver Resultados
                </button>
            </div></div>
        `;
        this.dom.app.innerHTML = html;
    },

    handleVakInput(id, val) {
        this.state.answers.vak[id] = val;
        this.saveState();
        this.renderVak();
    },

    validateKolbRow(rowValues) {
        const values = Object.values(rowValues).map(Number);
        if (values.length !== 4) return false;
        const uniqueValues = new Set(values);
        if (uniqueValues.size !== 4) return false;
        if (!values.every(v => v >= 1 && v <= 4)) return false;
        return true;
    },

    validateAndNext(section, next) {
        if (section === 'kolb') {
            const answers = this.state.answers.kolb;
            const rows = this.state.questions.kolb.questions;

            for (let q of rows) {
                const rowAns = answers[q.id] || {};
                if (!this.validateKolbRow(rowAns)) {
                    alert(`Fila ${q.id}: Debe usar los números del 1 al 4, uno para cada opción, sin repetir.`);
                    return;
                }
            }
        }
        else if (section === 'chaea') {
            const currentQ = this.state.questions.chaea.questions;
            const missing = [];
            currentQ.forEach(q => {
                if (this.state.answers.chaea[q.id] === undefined) missing.push(q.id);
            });
            if (missing.length > 0) {
                alert(`Faltan las preguntas: ${missing.join(', ')}`);
                return;
            }
        }
        else if (section === 'vak') {
            const qs = this.state.questions.vak.questions;
            const ans = this.state.answers.vak;
            const missing = [];
            qs.forEach(q => {
                if (!ans[q.id]) missing.push(q.id);
            });

            if (missing.length > 0) {
                alert(`Por favor responda las preguntas del VAK: ${missing.join(', ')}`);
                return;
            }
        }

        this.navigate(next);
    },

    calculateResults() {
        if (this.state.isExistingUser && Object.keys(this.state.scores.kolb.profile || {}).length > 0) return;

        // KOLB
        let k = { EC: 0, OR: 0, CA: 0, EA: 0 };
        Object.values(this.state.answers.kolb).forEach(row => {
            Object.entries(row).forEach(([s, v]) => k[s] += v);
        });
        const kX = k.CA - k.EC;
        const kY = k.EA - k.OR;

        let kName = "Indeterminado";
        let kDesc = "";

        if (kX >= 3 && kY <= 2) {
            kName = "Asimilador";
            kDesc = "Estrategias DUA: Clases magistrales, lectura de textos, gráficos y modelos teóricos. Fomentar la investigación.";
        } else if (kX >= 3 && kY >= 3) {
            kName = "Convergente";
            kDesc = "Estrategias DUA: Proyectos prácticos, estudios de caso, simulaciones y resolución de problemas técnicos.";
        } else if (kX <= 2 && kY <= 2) {
            kName = "Divergente";
            kDesc = "Estrategias DUA: Lluvia de ideas, trabajo en grupo, juegos de rol y exploración creativa.";
        } else if (kX <= 2 && kY >= 3) {
            kName = "Acomodador";
            kDesc = "Estrategias DUA: Trabajo de campo, experimentos, aprendizaje por descubrimiento y actividades desafiantes.";
        }

        // CHAEA
        let c = { Activo: 0, Reflexivo: 0, Teórico: 0, Pragmático: 0 };
        const chaeaAns = this.state.answers.chaea;
        for (let i = 1; i <= 80; i++) {
            if (chaeaAns[i] === 1) {
                if (i <= 20) c.Activo++;
                else if (i <= 40) c.Reflexivo++;
                else if (i <= 60) c.Teórico++;
                else c.Pragmático++;
            }
        }

        // Find CHAEA Dominant Style
        let maxVal = -1;
        let dominantStyle = "Indeterminado";
        Object.entries(c).forEach(([style, val]) => {
            if (val > maxVal) {
                maxVal = val;
                dominantStyle = style;
            }
        });

        // VAK (Case Insensitive Fix)
        let v = { Visual: 0, Auditivo: 0, Kinestesico: 0 };
        Object.values(this.state.answers.vak).forEach(val => {
            if (!val) return;
            const normalized = val.toLowerCase();
            if (normalized === 'visual') v.Visual++;
            if (normalized === 'auditivo') v.Auditivo++;
            if (normalized === 'kinestesico') v.Kinestesico++;
        });

        // Find VAK Dominant Style
        let maxVak = -1;
        let dominantVak = "Indeterminado";
        Object.entries(v).forEach(([style, val]) => {
            if (val > maxVak) {
                maxVak = val;
                dominantVak = style;
            }
        });

        this.state.scores = {
            kolb: { profile: { name: kName, description: kDesc }, x: kX, y: kY },
            chaea: { ...c, profile: dominantStyle },
            vak: { ...v, profile: dominantVak }
        };

        this.saveState();
    },

    // =========================================================================
    // VIEWS
    // =========================================================================
    views: {
        welcome: () => `
            <div class="text-center py-20 animate-fade-in-up relative">
                <div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-sena-green/10 rounded-full blur-3xl -z-10"></div>
                
                <h1 class="text-5xl md:text-7xl font-black mb-6 font-sans tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900">
                    Caracterización <br/><span class="text-sena-green">SENA ${new Date().getFullYear()}</span>
                </h1>
                
                <p class="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
                    Descubre tu potencial de aprendizaje mediante nuestra herramienta integral de diagnóstico.
                    <span class="block mt-4 text-base bg-amber-50 text-amber-800 py-2 px-4 rounded-full inline-block border border-amber-200">
                        ✨ Requerido para la formación profesional integral
                    </span>
                </p>
                
                <div class="flex flex-col md:flex-row justify-center gap-6 mb-20 animate-bounce-slow">
                    <button onclick="App.navigate('register')" class="group relative bg-sena-green text-white font-bold py-4 px-10 rounded-full shadow-xl shadow-green-500/40 hover:shadow-green-500/60 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                        <span class="relative z-10 flex items-center gap-2">
                            INICIAR DIAGNÓSTICO
                            <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                        </span>
                        <div class="absolute inset-0 bg-white/20 transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <div class="glass-card p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 group cursor-default">
                        <div class="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                            <svg class="w-8 h-8 text-blue-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-900 mb-2">Kolb</h3>
                        <p class="text-gray-500 text-sm leading-relaxed">Analiza cómo procesas la información y tu ciclo de aprendizaje experiencial.</p>
                    </div>
                    
                    <div class="glass-card p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 group cursor-default">
                        <div class="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                             <svg class="w-8 h-8 text-purple-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-900 mb-2">CHAEA</h3>
                        <p class="text-gray-500 text-sm leading-relaxed">Identifica tus preferencias a la hora de abordar nuevos contenidos.</p>
                    </div>

                    <div class="glass-card p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 group cursor-default">
                        <div class="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                             <svg class="w-8 h-8 text-indigo-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-900 mb-2">VAK</h3>
                        <p class="text-gray-500 text-sm leading-relaxed">Determina tu canal sensorial predominante: Visual, Auditivo o Kinestésico.</p>
                    </div>
                </div>
            </div>
        `,

        results: () => {
            const s = App.state.scores;
            const p = App.state.userProfile;

            // Helper for bars
            const bar = (val, max, color) => `
                <div class="h-3 w-full bg-gray-100 rounded-full overflow-hidden mb-1">
                    <div class="h-full bg-${color}-500 rounded-full shadow-lg shadow-${color}-500/40 relative" style="width: ${(val / max) * 100}%">
                         <div class="absolute inset-0 bg-white/20"></div>
                    </div>
                </div>
            `;

            return `
             <div class="max-w-6xl mx-auto py-10 animate-fade-in-up">
                
                <!-- Hero Profile -->
                <div class="glass-card p-8 rounded-3xl shadow-xl mb-12 relative overflow-hidden text-center md:text-left border-l-8 border-sena-green">
                     <div class="absolute top-0 right-0 w-64 h-64 bg-sena-green/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
                     
                     <div class="flex flex-col md:flex-row items-center gap-6">
                        <div class="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-lg">
                            ${p.nombre.charAt(0)}${p.apellidos.charAt(0)}
                        </div>
                        <div>
                            <h2 class="text-3xl font-black text-gray-900 leading-none mb-1">Resultados de Diagnóstico</h2>
                             <p class="text-gray-500 text-lg">Aprendiz: <span class="font-bold text-gray-800">${p.nombre} ${p.apellidos}</span></p>
                             <div class="flex gap-3 mt-3 justify-center md:justify-start">
                                <span class="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm">ID: ${p.documento}</span>
                                <span class="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm">Ficha: ${p.ficha}</span>
                             </div>
                        </div>
                     </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <!-- KOLB Card -->
                    <div class="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow relative overflow-hidden group">
                        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                        <div class="flex justify-between items-start mb-4">
                            <h3 class="text-xl font-bold text-gray-800">Perfil Kolb</h3>
                            <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">Procesamiento</span>
                        </div>
                        
                        <div class="text-center py-6">
                            <div class="text-3xl font-black text-blue-600 mb-2 drop-shadow-sm">${s.kolb.profile.name}</div>
                            <div class="inline-block bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 text-xs text-gray-400 font-mono mb-4">
                                Coordenadas: X=${s.kolb.x}, Y=${s.kolb.y}
                            </div>
                            <p class="text-sm text-gray-600 italic border-t border-gray-100 pt-4 leading-relaxed">
                                <span class="font-bold text-sena-black not-italic block mb-1">Recomendación Pedagógica (DUA):</span>
                                ${s.kolb.profile.description || 'Sin recomendación específica.'}
                            </p>
                        </div>
                    </div>

                     <!-- CHAEA Card -->
                    <div class="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow relative overflow-hidden">
                        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-purple-600"></div>
                        <div class="flex justify-between items-start mb-6">
                            <h3 class="text-xl font-bold text-gray-800">Perfil CHAEA</h3>
                            <span class="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">Estudio</span>
                        </div>
                        
                        <div class="text-center mb-6">
                             <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Estilo Dominante</span>
                             <div class="text-2xl font-black text-purple-600 mt-1">${s.chaea.profile || 'Indeterminado'}</div>
                        </div>

                        <div class="space-y-4">
                             ${Object.entries(s.chaea).map(([k, v]) => {
                if (k === 'profile') return ''; // Don't graph the profile name
                return `
                                <div>
                                    <div class="flex justify-between text-sm mb-1">
                                        <span class="font-medium text-gray-600">${k}</span>
                                        <span class="font-bold text-purple-600">${v}/20</span>
                                    </div>
                                    ${bar(v, 20, 'purple')}
                                </div>
                             `;
            }).join('')}
                        </div>
                    </div>

                     <!-- VAK Card -->
                    <div class="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow relative overflow-hidden">
                        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-indigo-600"></div>
                         <div class="flex justify-between items-start mb-6">
                            <h3 class="text-xl font-bold text-gray-800">Canal VAK</h3>
                            <span class="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold">Sensorial</span>
                        </div>

                         <div class="text-center mb-6">
                             <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Canal Dominante</span>
                             <div class="text-2xl font-black text-indigo-600 mt-1">${s.vak.profile || 'Indeterminado'}</div>
                        </div>

                        <div class="space-y-4">
                             ${Object.entries(s.vak).map(([k, v]) => {
                if (k === 'profile') return '';
                return `
                                <div>
                                    <div class="flex justify-between text-sm mb-1">
                                        <span class="font-medium text-gray-600">${k}</span>
                                        <span class="font-bold text-indigo-600">${v}/36</span>
                                    </div>
                                    ${bar(v, 36, 'indigo')}
                                </div>
                             `;
            }).join('')}
                        </div>
                    </div>
                </div>
                </div>

                ${!App.state.isExistingUser ? `
                <div class="text-center py-8">
                    <button id="btnSave" onclick="App.saveToGoogleSheets()" class="group relative bg-gradient-to-r from-sena-green to-green-700 text-white font-bold py-5 px-12 rounded-full shadow-2xl shadow-green-500/40 hover:shadow-green-500/60 hover:scale-105 transition-all duration-300">
                        <span class="relative z-10 flex items-center justify-center gap-3 text-lg">
                            <svg class="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                            GUARDAR RESULTADOS
                        </span>
                        <div class="absolute inset-0 bg-white/20 transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                    </button>
                    <div id="saveStatus" class="mt-6 text-center"></div>
                </div>
                ` : `
                <div class="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center max-w-2xl mx-auto">
                    <p class="text-blue-800 font-medium">✨ Estos resultados han sido recuperados exitosamente de la base de datos.</p>
                </div>
                `}
             </div>
             `;
        }
    },

    async saveToGoogleSheets() {
        const btn = document.getElementById('btnSave');
        const st = document.getElementById('saveStatus');
        btn.disabled = true;
        btn.innerHTML = `<span class="flex items-center gap-2"><svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> GUARDANDO...</span>`;

        const payload = {
            action: 'save',
            ...this.state.userProfile,
            kolb_profile: this.state.scores.kolb.profile.name,
            kolb_x: this.state.scores.kolb.x,
            kolb_y: this.state.scores.kolb.y,
            chaea_activo: this.state.scores.chaea.Activo,
            chaea_reflexivo: this.state.scores.chaea.Reflexivo,
            chaea_teorico: this.state.scores.chaea.Teórico,
            chaea_pragmatico: this.state.scores.chaea.Pragmático,
            vak_scores: this.state.scores.vak,
            vak_visual: this.state.scores.vak.Visual,
            vak_auditivo: this.state.scores.vak.Auditivo,
            vak_kinestesico: this.state.scores.vak.Kinestesico
        };

        try {
            if (GAS_URL.includes('ExamplePlaceholder')) throw new Error('Configura la URL del Script');

            await fetch(GAS_URL, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            st.innerHTML = '<div class="text-green-800 font-bold bg-green-100 border border-green-200 p-4 rounded-xl flex items-center justify-center gap-2 animate-bounce-small">✅ ¡Datos guardados y correo enviado!</div>';
            btn.innerHTML = 'DATOS REGISTRADOS';
            btn.classList.remove('bg-gradient-to-r', 'from-sena-green', 'to-green-700');
            btn.classList.add('bg-gray-400', 'cursor-not-allowed');
        } catch (e) {
            console.error(e);
            // Simulate success for local dev
            st.innerHTML = `<div class="text-yellow-700 bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm mt-2"><b>Modo Offline:</b> Datos guardados localmente (Simulación). En producción se enviaría al servidor.</div>`;
            btn.innerHTML = 'GUARDADO LOCAL';
            btn.classList.remove('bg-sena-green');
            btn.classList.add('bg-yellow-600');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
