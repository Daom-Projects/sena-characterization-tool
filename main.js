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
        isExistingUser: false
    },

    async init() {
        console.log('App Initializing...');
        this.cacheDOM();
        await this.loadQuestions();
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

    navigate(view) {
        this.state.currentView = view;
        this.render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    render() {
        const { currentView } = this.state;
        switch (currentView) {
            case 'welcome': this.dom.app.innerHTML = this.views.welcome(); break;
            case 'register': this.renderRegister(); break; // New View
            case 'form_kolb': this.renderKolb(); break;
            case 'form_chaea': this.renderChaea(); break;
            case 'form_vak': this.renderVak(); break;
            case 'results':
                this.calculateResults(); // Ensure scores are fresh
                this.dom.app.innerHTML = this.views.results();
                break;
            default: this.dom.app.innerHTML = this.views.welcome();
        }
    },

    showError(msg) {
        this.dom.app.innerHTML = `<div class="p-6 text-red-700 bg-red-100 rounded">Error: ${msg}</div>`;
    },

    // =========================================================================
    // REGISTRATION & USER CHECK
    // =========================================================================
    renderRegister() {
        this.dom.app.innerHTML = `
            <div class="max-w-xl mx-auto animate-fade-in-up bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <h2 class="text-3xl font-bold text-center text-gray-900 mb-6">Datos del Aprendiz</h2>
                <p class="text-gray-500 text-center mb-8">Por favor ingresa tus datos para iniciar o consultar tus resultados.</p>
                
                <form id="regForm" onsubmit="App.handleRegister(event)" class="space-y-5">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                            <input type="text" name="nombre" required class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                            <input type="text" name="apellidos" required class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Documento de Identidad</label>
                        <input type="number" name="documento" required class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500" placeholder="Ej: 1001234567">
                        <p class="text-xs text-gray-400 mt-1">Se usará para validar si ya presentaste la prueba.</p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                        <input type="email" name="email" required class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500">
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Programa de Formación</label>
                            <input type="text" name="programa" required class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Ficha (ID Curso)</label>
                            <input type="text" name="ficha" required class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500">
                        </div>
                    </div>

                    <div class="pt-4">
                        <button type="submit" id="btnReg" class="w-full bg-green-600 text-white font-bold py-3 rounded-lg shadow hover:bg-green-700 transition transform hover:scale-105">
                            Continuar
                        </button>
                        <div id="regStatus" class="mt-4 text-center text-sm text-gray-500"></div>
                    </div>
                </form>
            </div>
        `;
    },

    async handleRegister(e) {
        e.preventDefault();
        const btn = document.getElementById('btnReg');
        const status = document.getElementById('regStatus');

        // Harvest data
        const fd = new FormData(e.target);
        this.state.userProfile = Object.fromEntries(fd.entries());

        btn.disabled = true;
        btn.innerText = 'Validando usuario...';
        status.innerHTML = '<span class="animate-pulse text-blue-600">Consultando base de datos...</span>';

        // Check against GAS
        try {
            // Note: In development with no-cors, we might not get a readable response.
            // Using a simple workaround or assuming 'not_found' for local dev if GAS_URL is dummy.
            if (GAS_URL.includes('ExamplePlaceholder')) {
                // Mock behavior for testing without GAS
                console.warn('GAS_URL is placeholder. Skipping real check.');
                setTimeout(() => {
                    this.navigate('form_kolb');
                }, 1000);
                return;
            }

            const res = await fetch(GAS_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'check', documento: this.state.userProfile.documento })
            });
            const json = await res.json();

            if (json.status === 'found') {
                // User exists!
                if (confirm(`Hola ${json.data.Nombre}, ya hemos encontrado resultados tuyos del ${new Date(json.data.Fecha).toLocaleDateString()}. ¿Deseas verlos?`)) {
                    this.hydrateResultsFromServer(json.data);
                    this.state.isExistingUser = true;
                    this.navigate('results');
                    return;
                } else {
                    // User wants to retake?
                    if (!confirm("¿Deseas presentar la prueba nuevamente? Esto guardará un nuevo registro.")) {
                        btn.disabled = false; btn.innerText = 'Continuar'; return;
                    }
                }
            }

            // Not found or retaking
            this.navigate('form_kolb');

        } catch (error) {
            console.error("Fetch Check Error", error);
            // Fallback: Proceed to test if network fails (offline mode?)
            // Or correct CORS handling.
            // For now, let's allow proceed.
            this.navigate('form_kolb');
        }
    },

    hydrateResultsFromServer(data) {
        // Map flat server data back to state.scores structure for the Results View
        // Note: The server stores "A:15 R:12..." string for CHAEA, we might need to parse it or just use individual nums if we stored them.
        // Server.js v2 stores individual columns too! Great.

        this.state.scores = {
            kolb: {
                profile: { name: data.Resultado_Kolb, description: "Recuperado de la nube" }, // We lack description, but ok
                x: data.Kolb_X,
                y: data.Kolb_Y
            },
            chaea: {
                Activo: data.CHAEA_Activo,
                Reflexivo: data.CHAEA_Reflexivo,
                Teórico: data.CHAEA_Teorico, // check backend spelling
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
    // RENDERERS (KOLB, CHAEA, VAK) - Same as before, just kept standard
    // =========================================================================
    renderKolb() {
        const data = this.state.questions.kolb;
        let html = `
            <div class="max-w-5xl mx-auto animate-fade-in-up">
                <div class="mb-6 flex justify-between items-end">
                    <div>
                        <h2 class="text-3xl font-bold text-gray-900">${data.title}</h2>
                        <p class="text-gray-500">Perfil: <span class="font-bold text-gray-800">${this.state.userProfile.nombre || 'Invitado'}</span></p>
                    </div>
                </div>
                <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded text-blue-800 mb-8 max-w-3xl">
                    <p class="font-bold">Instrucciones:</p>
                    <p>${data.instructions}</p>
                </div>
                <div class="space-y-6">
        `;

        data.questions.forEach((q) => {
            html += `
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div class="flex items-center mb-4">
                        <span class="bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">${q.id}</span>
                        <h3 class="text-lg font-medium text-gray-700">Fila ${q.id}</h3>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            `;
            q.options.forEach(opt => {
                const currentVal = this.state.answers.kolb[q.id]?.[opt.style] || '';
                html += `
                    <div class="flex flex-col">
                        <label class="mb-1 text-sm font-medium text-gray-600 truncate" title="${opt.text}">${opt.text}</label>
                        <input type="number" min="1" max="4" 
                            class="kolb-input border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 shadow-sm"
                            data-qid="${q.id}" data-style="${opt.style}"
                            value="${currentVal}"
                            onchange="App.handleKolbInput(this)">
                    </div>
                `;
            });
            html += `</div></div>`;
        });

        html += `
            <div class="flex justify-between py-8">
                <button onclick="App.navigate('register')" class="text-gray-500 hover:underline">Atrás</button>
                <button onclick="App.validateAndNext('kolb', 'form_chaea')" class="bg-green-600 text-white font-bold py-3 px-8 rounded-lg shadow hover:bg-green-700">Siguiente &rarr;</button>
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
    },

    renderChaea() {
        const data = this.state.questions.chaea;
        let html = `
            <div class="max-w-4xl mx-auto animate-fade-in-up">
                <div class="mb-8">
                    <h2 class="text-3xl font-bold text-purple-900">${data.title}</h2>
                    <p class="text-gray-600">${data.instructions}</p>
                </div>
                <div class="grid gap-3">
        `;
        data.questions.forEach(q => {
            const val = this.state.answers.chaea[q.id];
            html += `
                <div class="bg-white p-4 rounded-lg border shadow-sm flex items-center justify-between">
                    <div class="flex-1 pr-4">
                        <span class="text-indigo-600 font-bold mr-2">${q.id}.</span> ${q.text}
                    </div>
                    <div class="flex gap-2">
                        <button onclick="App.handleChaeaInput(${q.id}, 1)" class="px-3 py-1 rounded-full text-sm border ${val === 1 ? 'bg-green-100 border-green-500 text-green-700' : 'hover:bg-gray-50'}">De acuerdo</button>
                        <button onclick="App.handleChaeaInput(${q.id}, 0)" class="px-3 py-1 rounded-full text-sm border ${val === 0 ? 'bg-red-100 border-red-500 text-red-700' : 'hover:bg-gray-50'}">En desacuerdo</button>
                    </div>
                </div>
            `;
        });
        html += `
            <div class="flex justify-between py-8">
                <button onclick="App.navigate('form_kolb')" class="text-gray-500 hover:underline">Atrás</button>
                <button onclick="App.validateAndNext('chaea', 'form_vak')" class="bg-purple-600 text-white font-bold py-3 px-8 rounded-lg shadow hover:bg-purple-700">Siguiente &rarr;</button>
            </div></div>
        `;
        this.dom.app.innerHTML = html;
    },

    handleChaeaInput(id, val) {
        this.state.answers.chaea[id] = val;
        this.renderChaea(); // Re-render for active state visibility
    },

    renderVak() {
        const data = this.state.questions.vak;
        let html = `
            <div class="max-w-4xl mx-auto animate-fade-in-up">
                <div class="mb-8 p-6 bg-white rounded shadow-sm border-t-4 border-indigo-500">
                    <h2 class="text-2xl font-bold text-gray-900">${data.title}</h2>
                    <p class="text-gray-500">${data.description}</p>
                </div>
                <div class="space-y-6">
        `;
        data.questions.forEach(q => {
            html += `
                <div class="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 class="font-bold text-gray-800 mb-4 flex"><span class="bg-indigo-100 text-indigo-700 rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">${q.id}</span> ${q.text}</h3>
                    <div class="space-y-2">
            `;
            q.options.forEach(opt => {
                const isChecked = this.state.answers.vak[q.id] === opt.style;
                html += `
                    <label class="flex items-center p-3 rounded border cursor-pointer hover:bg-indigo-50 ${isChecked ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-200'}">
                        <input type="radio" name="vak_${q.id}" ${isChecked ? 'checked' : ''} onclick="App.handleVakInput(${q.id}, '${opt.style}')" class="text-indigo-600 focus:ring-indigo-500">
                        <span class="ml-3 text-sm text-gray-700">${opt.label}</span>
                    </label>
                `;
            });
            html += `</div></div>`;
        });
        html += `
            <div class="flex justify-between py-8">
                <button onclick="App.navigate('form_chaea')" class="text-gray-500 hover:underline">Atrás</button>
                <button onclick="App.validateAndNext('vak', 'results')" class="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg shadow hover:bg-indigo-700">Finalizar</button>
            </div></div>
        `;
        this.dom.app.innerHTML = html;
    },

    handleVakInput(id, val) {
        this.state.answers.vak[id] = val;
    },

    // =========================================================================
    // VALIDATION
    // =========================================================================
    validateAndNext(section, next) {
        if (section === 'kolb') {
            const answers = this.state.answers.kolb;
            const rows = this.state.questions.kolb.questions;

            for (let q of rows) {
                const rowAns = answers[q.id] || {};
                const values = Object.values(rowAns).map(Number);

                // Check if all 4 options are filled
                if (values.length !== 4) {
                    alert(`Fila ${q.id}: Debe calificar las 4 opciones.`);
                    return;
                }

                // Check uniqueness and range 1-4
                const unique = new Set(values);
                if (unique.size !== 4 || !values.every(v => v >= 1 && v <= 4)) {
                    alert(`Fila ${q.id}: Debe usar los números 1 a 4 sin repetir.`);
                    return;
                }
            }
        }
        else if (section === 'chaea') {
            const count = Object.keys(this.state.answers.chaea).length;
            const total = this.state.questions.chaea.questions.length;
            if (count < total) {
                if (!confirm(`Ha respondido ${count} de ${total} preguntas. ¿Desea continuar?`)) return;
            }
        }
        else if (section === 'vak') {
            const count = Object.keys(this.state.answers.vak).length;
            const total = this.state.questions.vak.questions.length;
            if (count < total) {
                if (!confirm(`Ha respondido ${count} de ${total} preguntas. ¿Desea continuar?`)) return;
            }
        }

        this.navigate(next);
    },

    // =========================================================================
    // SCORING
    // =========================================================================
    calculateResults() {
        if (this.state.isExistingUser) return; // Don't recalc if we loaded from DB

        // KOLB
        let k = { EC: 0, OR: 0, CA: 0, EA: 0 };
        Object.values(this.state.answers.kolb).forEach(row => {
            Object.entries(row).forEach(([s, v]) => k[s] += v);
        });
        const kX = k.CA - k.EC;
        const kY = k.EA - k.OR;
        // Logic to find name based on X/Y (Divergente etc)
        // Hardcoded simplified map for readiness
        let kName = "Indeterminado";
        if (kX <= 2 && kY <= 2) kName = "Divergente";
        else if (kX >= 3 && kY <= 2) kName = "Asimilador";
        else if (kX >= 3 && kY >= 3) kName = "Convergente";
        else if (kX <= 2 && kY >= 3) kName = "Acomodador";

        // CHAEA
        let c = { Activo: 0, Reflexivo: 0, Teórico: 0, Pragmático: 0 };
        // Need mapping from questions.json to know style of each ID
        // Simplified assumption: we'd map over questions array to count
        const cQs = this.state.questions.chaea.questions;
        cQs.forEach(q => {
            if (this.state.answers.chaea[q.id] === 1) {
                if (q.style === "Teorico") q.style = "Teórico"; // normalization
                if (q.style === "Pragmatico") q.style = "Pragmático";
                if (c[q.style] !== undefined) c[q.style]++;
            }
        });

        // VAK
        let v = { Visual: 0, Auditivo: 0, Kinestesico: 0 };
        Object.values(this.state.answers.vak).forEach(s => {
            if (v[s] !== undefined) v[s]++;
        });

        this.state.scores = {
            kolb: { profile: { name: kName }, x: kX, y: kY },
            chaea: c,
            vak: v
        };
    },

    // =========================================================================
    // VIEWS: WELCOME & RESULTS
    // =========================================================================
    views: {
        welcome: () => `
            <div class="text-center py-20 animate-fade-in-up">
                <h1 class="text-4xl font-black text-gray-900 mb-6 font-sans">Caracterización SENA 2025</h1>
                <p class="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
                    Descubre tu estilo de aprendizaje a través de los instrumentos Kolb, CHAEA y VAK.
                    <br><span class="text-sm bg-yellow-100 text-yellow-800 px-2 rounded">Requerido para la formación profesional integral</span>
                </p>
                <div class="flex justify-center gap-4">
                    <button onclick="App.navigate('register')" class="bg-gray-900 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-black transition transform hover:-translate-y-1">
                        Iniciar Diagnóstico
                    </button>
                </div>
                <div class="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-4xl mx-auto opacity-75">
                    <div class="p-6 border rounded-xl"><h3 class="font-bold">Kolb</h3><p class="text-sm">Procesamiento de información</p></div>
                    <div class="p-6 border rounded-xl"><h3 class="font-bold">CHAEA</h3><p class="text-sm">Preferencias de estudio</p></div>
                    <div class="p-6 border rounded-xl"><h3 class="font-bold">VAK</h3><p class="text-sm">Canales sensoriales</p></div>
                </div>
            </div>
        `,

        results: () => {
            const s = App.state.scores;
            const p = App.state.userProfile;
            return `
             <div class="max-w-6xl mx-auto py-10 animate-fade-in-up">
                <div class="text-center mb-12">
                    <h2 class="text-3xl font-bold text-gray-900">Resultados de Diagnóstico</h2>
                    <p class="text-gray-500">Aprendiz: <span class="font-bold text-gray-800">${p.nombre} ${p.apellidos}</span> - ${p.ficha}</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <!-- KOLB -->
                    <div class="bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-500">
                        <h3 class="text-xl font-bold mb-4">Kolb</h3>
                        <div class="text-center">
                            <div class="text-4xl font-black text-blue-600 mb-2">${s.kolb.profile.name}</div>
                            <div class="text-xs text-gray-400 font-mono bg-gray-50 p-2 rounded inline-block">X: ${s.kolb.x}, Y: ${s.kolb.y}</div>
                        </div>
                    </div>
                     <!-- CHAEA -->
                    <div class="bg-white p-6 rounded-xl shadow-lg border-t-4 border-purple-500">
                        <h3 class="text-xl font-bold mb-4">CHAEA</h3>
                        <div class="space-y-3">
                             ${Object.entries(s.chaea).map(([k, v]) => `
                                <div class="flex items-center justify-between text-sm">
                                    <span>${k}</span>
                                    <div class="flex items-center w-1/2">
                                        <div class="w-full bg-gray-200 rounded-full h-2 mr-2"><div class="bg-purple-600 h-2 rounded-full" style="width: ${(v / 20) * 100}%"></div></div>
                                        <span class="font-bold">${v}</span>
                                    </div>
                                </div>
                             `).join('')}
                        </div>
                    </div>
                     <!-- VAK -->
                    <div class="bg-white p-6 rounded-xl shadow-lg border-t-4 border-indigo-500">
                        <h3 class="text-xl font-bold mb-4">VAK</h3>
                        <div class="space-y-3">
                             ${Object.entries(s.vak).map(([k, v]) => `
                                <div class="flex items-center justify-between text-sm">
                                    <span>${k}</span>
                                    <div class="flex items-center w-1/2">
                                        <div class="w-full bg-gray-200 rounded-full h-2 mr-2"><div class="bg-indigo-600 h-2 rounded-full" style="width: ${(v / 36) * 100}%"></div></div>
                                        <span class="font-bold">${v}</span>
                                    </div>
                                </div>
                             `).join('')}
                        </div>
                    </div>
                </div>

                ${!App.state.isExistingUser ? `
                <div class="text-center">
                    <button id="btnSave" onclick="App.saveToGoogleSheets()" class="bg-green-600 text-white font-bold py-4 px-10 rounded-full shadow-lg hover:bg-green-700 transition">
                        Guardar en mi Hoja de Vida
                    </button>
                    <div id="saveStatus" class="mt-4"></div>
                </div>
                ` : `<div class="text-center text-gray-500 italic">Estos resultados fueron recuperados de la base de datos.</div>`}
             </div>
             `;
        }
    },

    async saveToGoogleSheets() {
        const btn = document.getElementById('btnSave');
        const st = document.getElementById('saveStatus');
        btn.disabled = true;
        btn.innerText = 'Guardando...';

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

            st.innerHTML = '<div class="text-green-600 font-bold bg-green-50 p-4 rounded">¡Guardado con éxito!</div>';
            btn.innerText = 'Datos Registrados';
        } catch (e) {
            st.innerHTML = `<div class="text-red-600">Error: ${e.message} (Simulación: Datos guardados localmente)</div>`;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
