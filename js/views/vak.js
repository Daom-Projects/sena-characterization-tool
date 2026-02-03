/**
 * @module Views/VAK
 * @description Renderiza el cuestionario VAK (Visual, Auditivo, Kinestésico).
 * Muestra opciones con estilos visuales enriquecidos para mejorar la experiencia.
 */

export const vakView = (data, answers) => {
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
        const currentVal = answers[q.id];
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
    return html;
};
