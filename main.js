const { getData } = require('./data');
const { createWorksheet } = require('./excel');
const { sendEmail } = require('./email');
const { getDates } = require('./dates');

const fs = require('fs');
const path = require('path');

// Obtenemos fecha de hace 7 días para enviarla a la api. 
const dates = getDates();
console.log(dates);

async function execute() {
    // Obtenemos rows de la API    
    const rows = await getData(dFecha);
    // Archivo Local de pruebas
    // const res = getJson();
    // const rows = res && res.Result ? res.Result.Viajes : [];

    // 2. Si no hay datos, terminamos
    if (!rows || rows.length === 0) {
        console.log("No se obtuvieron registros de la API.");
        return;
    }
    
    console.log(`Se obtuvieron ${rows.length} registros.`);

    // Generamos el archivo Excel
    const filename = await createWorksheet(rows);

    // Enviamos por correo
    // await sendEmail(filename);

}

function getJson() {
    try {
        const filename = path.join(__dirname, 'files', 'respuesta_api.json');
        
        // Verificamos si el archivo existe antes de leerlo
        if (!fs.existsSync(filename)) {
            console.error("El archivo no existe en:", filename);
            return null;
        }

        const content = fs.readFileSync(filename, 'utf8');
        return JSON.parse(content);
        
    } catch (error) {
        console.error("Error al leer o parsear el JSON:", error.message);
        return null;
    }
}

// Ejecutar todo el proceso
// execute();