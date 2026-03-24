const { getData } = require('./data');
const { createWorksheet } = require('./excel');
const { sendEmail } = require('./email');
const { getDates } = require('./dates');

const fs = require('fs');
const path = require('path');

async function execute() {
    // Obtenemos fecha de hace 7 días para enviarla a la api. 
    const dates = getDates();
    console.log(`Se obtendrán registros de las fechas: ${dates}`);

    // Obtenemos registros de la API dia por dia, iterando en dates 
    let rows = [];
    for (const date of dates) {
        console.log(`Consultando: ${date}`);
        try {
            const response = await getData(date);            
            // Verificamos la ruta del JSON: Result -> Viajes
            if (Array.isArray(response) && response.length > 0) {
                rows.push(...response);
                console.log(`Agregados ${response.length} viajes.`);
            } else {
                console.log(`No hubo viajes en la fecha ${date}`);
            }
        } catch (error) {
            console.error(`Error en fecha ${date}:`, error.message);
        }
    }
    // const rows = await getData(dFecha);

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
execute();