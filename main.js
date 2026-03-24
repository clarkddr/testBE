const { getData } = require('./data');
const { createWorksheet } = require('./excel');
const { sendEmail } = require('./email');

const fs = require('fs');
const path = require('path');

async function ejecutarReporte() {
    // Obtenemos registros de la API    
    const registros = await getData();
    // Archivo Local de pruebas
    // const res = getJson();
    // const registros = res && res.Result ? res.Result.Viajes : [];

    // 2. Si no hay datos, terminamos
    if (!registros || registros.length === 0) {
        console.log("No se obtuvieron registros de la API.");
        return;
    }
    
    console.log(`Se obtuvieron ${registros.length} registros.`);

    // Generamos el archivo Excel
    const filename = await createWorksheet(registros);

    // Enviamos por correo
    await sendEmail(filename);

}

function getJson() {
    try {
        const rutaArchivo = path.join(__dirname, 'files', 'respuesta_api.json');
        
        // Verificamos si el archivo existe antes de leerlo
        if (!fs.existsSync(rutaArchivo)) {
            console.error("El archivo no existe en:", rutaArchivo);
            return null;
        }

        const contenido = fs.readFileSync(rutaArchivo, 'utf8');
        return JSON.parse(contenido);
        
    } catch (error) {
        console.error("Error al leer o parsear el JSON:", error.message);
        return null;
    }
}


// Ejecutar todo el proceso
ejecutarReporte();