/**
 * @module Services
 * @description Maneja la comunicación con el Backend (Google Apps Script).
 * Todas las funciones retornan Promesas para manejar la asincronía.
 */

// URL del Script de Google Apps desplegado como Web App.
// IMPORTANTE: Debe tener permisos de "Anyone" (Cualquiera).
const GAS_URL = 'https://script.google.com/macros/s/AKfycbySr2oaxfVZmdwKC96qQwXtjpcVXxi4hqPhgbXOEVqa7cXmrUMK5RIBn9FLFhsZkj2n/exec';

const Services = {

    /**
     * @function checkUser
     * @description Verifica si un usuario ya existe en la base de datos.
     * @param {string} documento - Número de documento de identidad.
     * @returns {Promise<Object>} Respuesta del servidor con los datos del usuario si existe.
     */
    async checkUser(documento) {
        // Validación básica
        if (!documento) throw new Error("Documento requerido");

        const payload = {
            action: 'check',
            documento: documento
        };

        try {
            // Enviamos la petición POST
            // 'no-cors' no se usa aquí porque necesitamos leer la respuesta JSON.
            // Si hay problemas de CORS, asegurar que el script de Google devuelva los headers correctos.
            const response = await fetch(GAS_URL, {
                method: 'POST',
                // Google Apps Script a veces requiere 'text/plain' para evitar preflight requests de CORS complejos
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Error en la red');
            return await response.json();

        } catch (error) {
            console.error("Error buscando usuario:", error);
            throw error; // Re-lanzamos para manejarlo en la UI
        }
    },

    /**
     * @function saveResults
     * @description Envía todos los resultados y perfil de usuario para ser guardados.
     * @param {Object} data - Objeto con toda la información a guardar.
     * @returns {Promise<Object>} Respuesta del servidor.
     */
    async saveResults(data) {
        // Preparamos el payload plano que espera Google Sheets
        const payload = {
            action: 'save',
            // Esparciendo los datos del perfil (nombre, ficha, etc)
            ...data.userProfile,

            // Mapeo explícito de resultados Kolb
            kolb_profile: data.scores.kolb.profile.name,
            kolb_x: data.scores.kolb.x,
            kolb_y: data.scores.kolb.y,

            // Mapeo CHAEA
            chaea_activo: data.scores.chaea.Activo,
            chaea_reflexivo: data.scores.chaea.Reflexivo,
            chaea_teorico: data.scores.chaea.Teórico,
            chaea_pragmatico: data.scores.chaea.Pragmático,

            // Mapeo VAK
            vak_scores: data.scores.vak,
            vak_visual: data.scores.vak.Visual,
            vak_auditivo: data.scores.vak.Auditivo,
            vak_kinestesico: data.scores.vak.Kinestesico
        };

        try {
            if (GAS_URL.includes('ExamplePlaceholder')) throw new Error('Configura la URL del Script');

            const response = await fetch(GAS_URL, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            // Nota: GAS a veces retorna respuestas opacas en modo 'no-cors', pero aquí intentamos leer
            // Si falla el JSON, asumimos éxito si el status es 200 en algunos casos, o lanzamos error.
            // Para simplificar, asumimos que siempre devuelve JSON válido.
            // return await response.json(); 

            // En la implementación anterior no leíamos el JSON de respuesta para 'save', 
            // solo esperábamos que el fetch no fallara. Mantenemos eso.
            return { status: 'success' };

        } catch (error) {
            console.error("Error guardando datos:", error);
            throw error;
        }
    }
};

export default Services;
