/**
 * @module Views/Welcome
 * @description Vista de bienvenida / Landing Page.
 * Presenta el propósito de la herramienta y los accesos a los tests.
 */

export const welcomeView = () => `
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
`;
