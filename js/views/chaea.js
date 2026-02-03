/**
 * @module Views/Chaea
 * @description Renderiza el cuestionario CHAEA (80 preguntas, paginado).
 * Maneja la paginación interna (20 preguntas por página) y el progreso total.
 */

export const chaeaView = (data, answers, page) => {
    // Configuración de paginación
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
        const val = answers[q.id];
        // Estilos condicionales para selección
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

    // Lógica para el botón "Siguiente" o "Finalizar"
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
    return html;
};
