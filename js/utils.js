/**
 * @module Utils
 * @description Funciones auxiliares puras para cálculos y lógica de negocio.
 * No dependen del estado global ni del DOM.
 */

export const Utils = {

    /**
     * @function calculateKolbProfile
     * @description Determina el estilo Kolb basado en las coordenadas X (Percepción) y Y (Procesamiento).
     * @param {number} x - Coordenada X (CA - EC)
     * @param {number} y - Coordenada Y (EA - OR)
     * @returns {Object} { name: string, description: string }
     */
    calculateKolbProfile(x, y) {
        let kName = "Indeterminado";
        let kDesc = "";

        if (x >= 3 && y <= 2) {
            kName = "Asimilador";
            kDesc = "Estrategias DUA: Clases magistrales, lectura de textos, gráficos y modelos teóricos. Fomentar la investigación.";
        } else if (x >= 3 && y >= 3) {
            kName = "Convergente";
            kDesc = "Estrategias DUA: Proyectos prácticos, estudios de caso, simulaciones y resolución de problemas técnicos.";
        } else if (x <= 2 && y <= 2) {
            kName = "Divergente";
            kDesc = "Estrategias DUA: Lluvia de ideas, trabajo en grupo, juegos de rol y exploración creativa.";
        } else if (x <= 2 && y >= 3) {
            kName = "Acomodador";
            kDesc = "Estrategias DUA: Trabajo de campo, experimentos, aprendizaje por descubrimiento y actividades desafiantes.";
        }

        return { name: kName, description: kDesc };
    },

    /**
     * @function findDominant
     * @description Encuentra la clave con el valor numérico más alto en un objeto.
     * @param {Object} obj - Objeto de puntuaciones, ej: { Activo: 10, Reflexivo: 12 }
     * @returns {string} Nombre de la clave dominante.
     */
    findDominant(obj) {
        let maxVal = -1;
        let dominant = "Indeterminado";

        Object.entries(obj).forEach(([key, val]) => {
            // Ignoramos propiedades no numéricas si existen
            if (typeof val === 'number' && val > maxVal) {
                maxVal = val;
                dominant = key;
            }
        });

        return dominant;
    },

    /**
     * @function calculateScores
     * @description Procesa todas las respuestas crudas y genera el objeto de puntuaciones final.
     * @param {Object} answers - Objeto de respuestas { kolb, chaea, vak }
     * @returns {Object} Objeto de puntuaciones calculado.
     */
    calculateScores(answers) {
        // --- KOLB ---
        let k = { EC: 0, OR: 0, CA: 0, EA: 0 };
        // Validamos que existan respuestas para evitar crash
        if (answers.kolb) {
            Object.values(answers.kolb).forEach(row => {
                Object.entries(row).forEach(([style, val]) => {
                    // Aseguramos sumar números
                    if (k[style] !== undefined) k[style] += Number(val);
                });
            });
        }
        const kX = k.CA - k.EC;
        const kY = k.EA - k.OR;
        const kolbProfile = this.calculateKolbProfile(kX, kY);

        // --- CHAEA ---
        let c = { Activo: 0, Reflexivo: 0, Teórico: 0, Pragmático: 0 };
        const chaeaAns = answers.chaea || {};
        // Iteramos de 1 a 80
        for (let i = 1; i <= 80; i++) {
            if (chaeaAns[i] === 1) {
                if (i <= 20) c.Activo++;
                else if (i <= 40) c.Reflexivo++;
                else if (i <= 60) c.Teórico++;
                else c.Pragmático++;
            }
        }
        const chaeaProfile = this.findDominant(c);

        // --- VAK ---
        let v = { Visual: 0, Auditivo: 0, Kinestesico: 0 };
        if (answers.vak) {
            Object.values(answers.vak).forEach(val => {
                if (!val) return;
                const normalized = String(val).toLowerCase();
                if (normalized === 'visual') v.Visual++;
                if (normalized === 'auditivo') v.Auditivo++;
                if (normalized === 'kinestesico') v.Kinestesico++;
            });
        }
        const vakProfile = this.findDominant(v);

        return {
            kolb: { profile: kolbProfile, x: kX, y: kY },
            chaea: { ...c, profile: chaeaProfile },
            vak: { ...v, profile: vakProfile }
        };
    }
};
