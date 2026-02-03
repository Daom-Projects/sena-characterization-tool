/**
 * @module Views/Guide
 * @description Vista del Recurso Educativo (Guía Pedagógica).
 * Muestra información estática sobre los modelos Kolb, CHAEA y VAK.
 * Incluye navegación condicional (Volver a Resultados o Inicio).
 */

export const guideView = (isExistingUser, isSaved) => `
    <div class="max-w-6xl mx-auto py-10 animate-fade-in-up">
        <div class="mb-12 text-center">
            <span class="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Recurso Educativo 2026</span>
            <h2 class="text-4xl font-black text-gray-900 mt-4 leading-tight">Interpretación Pedagógica <br/><span class="text-sena-green">Modelo Integral SENA</span></h2>
            <p class="text-gray-500 max-w-3xl mx-auto mt-4 text-lg">Guía práctica para Instructores y Aprendices sobre los estilos de aprendizaje y su aplicación en la formación profesional.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <!-- KOLB Section -->
            <div class="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-10 -mt-10 blur-xl"></div>
                <h3 class="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                    <span class="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">1</span>
                    Modelo David Kolb
                </h3>
                <p class="text-gray-600 mb-6 leading-relaxed">Sitúa al aprendiz en dos ejes: <strong>Percepción</strong> (X) y <strong>Procesamiento</strong> (Y).</p>
                
                <div class="space-y-4">
                    <div class="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <h4 class="font-bold text-blue-800 text-sm uppercase mb-1">Divergente (X≤2, Y≤2)</h4>
                        <p class="text-sm text-gray-700">Imaginativo y empático. <strong>Estrategia:</strong> Lluvia de ideas y simulaciones.</p>
                    </div>
                    <div class="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <h4 class="font-bold text-blue-800 text-sm uppercase mb-1">Asimilador (X≥3, Y≤2)</h4>
                        <p class="text-sm text-gray-700">Lógico y teórico. <strong>Estrategia:</strong> Lecturas, debates e informes.</p>
                    </div>
                    <div class="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <h4 class="font-bold text-blue-800 text-sm uppercase mb-1">Convergente (X≥3, Y≥3)</h4>
                        <p class="text-sm text-gray-700">Práctico y técnico. <strong>Estrategia:</strong> Proyectos y resolución de problemas.</p>
                    </div>
                    <div class="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <h4 class="font-bold text-blue-800 text-sm uppercase mb-1">Acomodador (X≤2, Y≥3)</h4>
                        <p class="text-sm text-gray-700">Pragmático y líder. <strong>Estrategia:</strong> Trabajo de campo y experimentos.</p>
                    </div>
                </div>
            </div>

            <!-- CHAEA Section -->
            <div class="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-10 -mt-10 blur-xl"></div>
                <h3 class="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                    <span class="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">2</span>
                    Cuestionario CHAEA
                </h3>
                <p class="text-gray-600 mb-6 leading-relaxed">Define rasgos de comportamiento operativo. El perfil puede ser multimodal.</p>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="p-4 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-purple-100">
                        <div class="font-bold text-purple-700 mb-1">Activo</div>
                        <div class="text-xs text-gray-500">Busca desafíos y resultados inmediatos.</div>
                    </div>
                    <div class="p-4 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-purple-100">
                        <div class="font-bold text-purple-700 mb-1">Reflexivo</div>
                        <div class="text-xs text-gray-500">Analiza datos antes de actuar.</div>
                    </div>
                    <div class="p-4 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-purple-100">
                        <div class="font-bold text-purple-700 mb-1">Teórico</div>
                        <div class="text-xs text-gray-500">Integra hechos en estructuras lógicas.</div>
                    </div>
                        <div class="p-4 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-purple-100">
                        <div class="font-bold text-purple-700 mb-1">Pragmático</div>
                        <div class="text-xs text-gray-500">Aplicación real y directa.</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- VAK & ROLE 2026 -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div class="lg:col-span-1 bg-white p-8 rounded-3xl shadow-lg border border-gray-100 relative overflow-hidden">
                <h3 class="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                    <span class="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">3</span>
                    Canales VAK
                </h3>
                <ul class="space-y-4">
                    <li class="flex items-start gap-3">
                        <span class="text-2xl">👁️</span>
                        <div><strong class="text-gray-800">Visual (65%)</strong><p class="text-xs text-gray-500">Imágenes, mapas mentales, videos.</p></div>
                    </li>
                    <li class="flex items-start gap-3">
                        <span class="text-2xl">👂</span>
                        <div><strong class="text-gray-800">Auditivo (30%)</strong><p class="text-xs text-gray-500">Debates, podcasts, lectura oral.</p></div>
                    </li>
                    <li class="flex items-start gap-3">
                        <span class="text-2xl">🤚</span>
                        <div><strong class="text-gray-800">Kinestésico (5%)</strong><p class="text-xs text-gray-500">Aprender haciendo, talleres.</p></div>
                    </li>
                </ul>
                </div>

                <div class="lg:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
                <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <h3 class="text-2xl font-black mb-6">El Rol del Instructor 2026</h3>
                <p class="text-gray-300 mb-6 leading-relaxed">Bajo la Reforma Laboral (Ley 2466) y el nuevo Reglamento, la caracterización es un derecho.</p>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                        <div class="font-bold text-sena-green text-sm mb-2">Ajustes Razonables (PIAR)</div>
                        <p class="text-xs text-gray-300">Diseñe planes específicos para aprendices con discapacidad o vulnerabilidad.</p>
                    </div>
                        <div class="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                        <div class="font-bold text-sena-green text-sm mb-2">Laboralización</div>
                        <p class="text-xs text-gray-300">Oriente hacia la modalidad productiva idónea (Pasantía, Contrato, etc).</p>
                    </div>
                        <div class="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                        <div class="font-bold text-sena-green text-sm mb-2">Diseño Universal (DUA)</div>
                        <p class="text-xs text-gray-300">No use etiquetas fijas. Diseñe con múltiples formas de implicación y acción.</p>
                    </div>
                </div>
                </div>
        </div>

        <div class="text-center">
            ${(isExistingUser || isSaved)
        ? `<button onclick="App.navigate('results')" class="bg-white text-gray-800 font-bold py-4 px-12 rounded-full shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    &larr; Volver a Mis Resultados
                    </button>`
        : `<button onclick="App.navigate('welcome')" class="bg-sena-green text-white font-bold py-4 px-12 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    &larr; Volver al Inicio
                    </button>`
    }
        </div>
    </div>
`;
