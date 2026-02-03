/**
 * @module Views/Register
 * @description Formulario de registro de datos del aprendiz.
 * Captura: Nombre, Apellidos, Documento, Correo, Ficha.
 * Llama a App.handleRegister al enviar.
 */

export const registerView = () => `
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
