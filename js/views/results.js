/**
 * @module Views/Results
 * @description Dashboard de resultados finales.
 * Visualiza los perfiles Kolb, CHAEA y VAK con gráficos de barras y descripciones pedagógicas.
 */

// Helper interno para generar barras de progreso HTML
const renderBar = (val, max, color) => `
    <div class="h-3 w-full bg-gray-100 rounded-full overflow-hidden mb-1">
        <div class="h-full bg-${color}-500 rounded-full shadow-lg shadow-${color}-500/40 relative" style="width: ${(val / max) * 100}%">
             <div class="absolute inset-0 bg-white/20"></div>
        </div>
    </div>
`;

export const resultsView = (state) => {
    const s = state.scores;
    const p = state.userProfile;

    return `
     <div class="max-w-6xl mx-auto py-10 animate-fade-in-up">
        
        <!-- Hero Profile -->
        <div class="glass-card p-8 rounded-3xl shadow-xl mb-12 relative overflow-hidden text-center md:text-left border-l-8 border-sena-green">
             <div class="absolute top-0 right-0 w-64 h-64 bg-sena-green/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
             
             <div class="flex flex-col md:flex-row items-center gap-6">
                <div class="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-lg">
                    ${(p.nombre ? p.nombre.charAt(0) : 'I')}${(p.apellidos ? p.apellidos.charAt(0) : '')}
                </div>
                <div>
                    <h2 class="text-3xl font-black text-gray-900 leading-none mb-1">Resultados de Diagnóstico</h2>
                     <p class="text-gray-500 text-lg">Aprendiz: <span class="font-bold text-gray-800">${p.nombre || 'Invitado'} ${p.apellidos || ''}</span></p>
                     <div class="flex gap-3 mt-3 justify-center md:justify-start">
                        <span class="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm">ID: ${p.documento || 'Provisorio'}</span>
                        <span class="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm">Ficha: ${p.ficha || 'Provisional'}</span>
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
        if (k === 'profile') return '';
        return `
                        <div>
                            <div class="flex justify-between text-sm mb-1">
                                <span class="font-medium text-gray-600">${k}</span>
                                <span class="font-bold text-purple-600">${v}/20</span>
                            </div>
                            ${renderBar(v, 20, 'purple')}
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
                            ${renderBar(v, 36, 'indigo')}
                        </div>
                     `;
    }).join('')}
                </div>
            </div>
        </div>
        </div>

        <div class="space-y-6 text-center py-8">
            <!-- Status Banner -->
            <div id="saveStatus" class="transition-all duration-500">
                ${state.isSaving ? `
                    <div class="inline-flex items-center gap-3 bg-blue-50 text-blue-700 px-6 py-3 rounded-full animate-pulse">
                        <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> 
                        <span class="font-bold">Guardando resultados en la nube...</span>
                    </div>
                ` : state.isSaved ? `
                    <div class="inline-flex items-center gap-3 bg-green-50 text-green-700 px-6 py-3 rounded-full shadow-sm border border-green-100">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        <span class="font-bold">¡Resultados guardados correctamente!</span>
                    </div>
                ` : state.saveError ? `
                    <div class="inline-flex items-center gap-3 bg-red-50 text-red-700 px-6 py-3 rounded-full shadow-sm border border-red-100 cursor-pointer hover:bg-red-100" onclick="App.saveToGoogleSheets()">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span class="font-bold">Error al guardar. Clic para reintentar.</span>
                    </div>
                ` : ''}
            </div>

            <!-- Pedagogical Guide Button -->
            <div class="mt-8">
                <button onclick="App.navigate('guide')" class="group relative bg-gradient-to-r from-gray-900 to-gray-700 text-white font-bold py-5 px-10 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                     <div class="flex items-center gap-4">
                        <div class="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                        </div>
                        <div class="text-left">
                            <div class="text-xs text-gray-300 uppercase tracking-wider font-semibold">Recurso Educativo</div>
                            <div class="text-lg leading-none">Ver Guía Pedagógica 2026</div>
                        </div>
                     </div>
                </button>
            </div>
        </div>
     </div>
    `;
};
