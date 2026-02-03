/**
 * @module Views/Kolb
 * @description Renderiza el cuestionario de Kolb.
 * Utiliza una matriz de selección única por fila (Radios simulados).
 */

export const kolbView = (data, answers, userProfile) => {
    let html = `
        <div class="max-w-5xl mx-auto animate-fade-in-up">
            <div class="mb-10 text-center">
                <span class="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Fase 1 de 3</span>
                <h2 class="text-4xl font-black text-gray-900 mt-4 mb-2">${data.title}</h2>
                <p class="text-gray-500 max-w-2xl mx-auto">Aprendiz: <span class="font-bold text-gray-800">${userProfile.nombre || 'Invitado'}</span></p>
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
                
                <div class="space-y-6 relative z-10">
        `;

        // Cabecera de la matriz
        html += `
            <div class="grid grid-cols-[1fr_repeat(4,minmax(40px,50px))] gap-4 mb-2 px-2">
                <span class="font-bold text-gray-400 text-xs uppercase tracking-widest self-end pb-2">Opciones</span>
                <div class="text-center font-bold text-gray-400 text-sm">1</div>
                <div class="text-center font-bold text-gray-400 text-sm">2</div>
                <div class="text-center font-bold text-gray-400 text-sm">3</div>
                <div class="text-center font-bold text-gray-400 text-sm">4</div>
            </div>
        `;

        q.options.forEach(opt => {
            const currentVal = answers[q.id]?.[opt.style];

            html += `
                <div class="grid grid-cols-[1fr_repeat(4,minmax(40px,50px))] gap-4 items-center bg-gray-50 p-4 rounded-xl border border-transparent hover:border-gray-200 transition-colors">
                    <label class="text-sm font-medium text-gray-700 leading-snug cursor-help" title="${opt.text}">${opt.text}</label>
                    
                    ${[1, 2, 3, 4].map(num => {
                const isSelected = currentVal === num;
                const btnClass = isSelected
                    ? 'bg-sena-green text-white shadow-lg scale-105 border-green-600 ring-2 ring-green-200'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-green-400 hover:text-green-600';

                return `
                            <button onclick="App.handleKolbInput(${q.id}, '${opt.style}', ${num})" 
                                class="w-10 h-10 md:w-12 md:h-12 rounded-lg border font-bold text-lg flex items-center justify-center transition-all duration-200 ${btnClass}">
                                ${num}
                            </button>
                        `;
            }).join('')}
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
    return html;
};
