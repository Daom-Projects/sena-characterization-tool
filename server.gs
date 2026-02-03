/**
 * SENA CHARACTERIZATION TOOL - BACKEND SCRIPT
 * Version: 2.0 (Supports Check & Save)
 */

const SHEET_NAME = "Respuestas";

function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Headers updated as per user request
    const headers = [
      "Fecha", 
      "Nombre", 
      "Apellidos", 
      "Documento", 
      "Email", 
      "Programa", 
      "Ficha",
      "Resultado_Kolb", 
      // Detailed scores for analysis
      "Kolb_X", "Kolb_Y",
      "Resultado_CHAEA",
      "CHAEA_Activo", "CHAEA_Reflexivo", "CHAEA_Teorico", "CHAEA_Pragmatico",
      "Resultado_VAK",
      "VAK_Visual", "VAK_Auditivo", "VAK_Kinestesico"
    ];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    // Action Dispatcher
    if (data.action === 'check') {
      return checkUser(sheet, data.documento);
    } else if (data.action === 'save') {
      return saveUser(sheet, data);
    } else {
      return response({ status: "error", message: "Invalid action" });
    }

  } catch (error) {
    return response({ status: "error", message: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

// Check if user exists based on "Documento" (Column index 3, 0-based)
function checkUser(sheet, documento) {
  if (!documento) return response({ status: "error", message: "Documento required" });
  
  const data = sheet.getDataRange().getValues();
  // Assume Row 1 is header. data[i][3] is Documento column (4th column)
  const headers = data[0];
  
  // Search from end to start to get latest result if duplicates exist
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][3]) === String(documento)) {
      // Found! Map row to object
      const record = {};
      headers.forEach((header, index) => {
        record[header] = data[i][index];
      });
      return response({ status: "found", data: record });
    }
  }
  
  return response({ status: "not_found" });
}

function saveUser(sheet, data) {
  const row = [
    new Date(), // Fecha
    data.nombre,
    data.apellidos,
    "'" + data.documento, // Force string to preserve leading zeros or avoid formatting
    data.email,
    data.programa,
    "'" + data.ficha,
    data.kolb_profile,
    data.kolb_x,
    data.kolb_y,
    // CHAEA composite score string or just breakdown? Let's do breakdown
    // User asked for "Resultado_CHAEA", let's make a summary string
    `A:${data.chaea_activo} R:${data.chaea_reflexivo} T:${data.chaea_teorico} P:${data.chaea_pragmatico}`,
    data.chaea_activo,
    data.chaea_reflexivo,
    data.chaea_teorico,
    data.chaea_pragmatico,
    // VAK
    Object.keys(data.vak_scores || {}).reduce((a, b) => data.vak_scores[a] > data.vak_scores[b] ? a : b, 'N/A'), // Winning VAK
    data.vak_visual,
    data.vak_auditivo,
    data.vak_kinestesico
  ];

  sheet.appendRow(row);

  // Email Notification
  try {
    const mensaje = `Hola ${data.nombre}, este es tu perfil de aprendizaje (SENA):\n\n` +
                  `Estilo Kolb: ${data.kolb_profile} (X:${data.kolb_x}, Y:${data.kolb_y})\n` +
                  `Perfil CHAEA: ${row[10]}\n` +
                  `Predominancia VAK: ${row[15]}\n\n` +
                  `Gracias por realizar la caracterización.`;
    
    MailApp.sendEmail(data.email, "Resultados Test Estilos de Aprendizaje - SENA", mensaje);
  } catch (e) {
    // Fail silently or log if email fails, but don't break the save response
    console.error("Email failed: " + e.toString()); 
  }

  return response({ status: "success", row: sheet.getLastRow() });
}

function response(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
