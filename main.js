const { getData } = require('./data');
const { createWorksheet } = require('./excel');
const { sendEmail } = require('./email');
const { getDates } = require('./dates');

async function execute() {
    // Obtenemos array de fechas de hace 7 días para enviarla a la api. 
    const dates = getDates();
    console.log(`Se obtendrán registros de las fechas: ${dates}`);

    // Obtenemos registros de la API dia por dia, iterando en dates 
    let rows = [];
    for (const date of dates) {
        console.log(`Consultando: ${date}`);
        try {
            const response = await getData(date);            
            // Verificamos la respuesta
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

    // Si no hay datos, terminamos
    if (!rows || rows.length === 0) {
        console.log("No se obtuvieron registros de la API.");
        return;
    }

    // Filtramos los resultados conforme lo solicitado, IdCliente == 402 
    // y Salida con valor, Llegada sin valor.   
    const filteredRows = rows.filter(row => 
        row.IdCliente == 402 &&
        !row.Salida.startsWith('0000') /* &&
        row.Llegada.startsWith('0000') */
    );    
    console.log(`Se obtuvieron ${filteredRows.length} registros.`);

    // Ordenamos el listado
    filteredRows.sort((a,b) => {
        return new Date(b.Salida) - new Date(a.Salida)
    });

    // Generamos el archivo Excel y agregamos las columnas "fijas"
    const dataForExcel = filteredRows.map(row => ({
        ...row,
        "PRUEBA" : "PRUEBA",
        "NS" : "NS"
    }));

    const filename = await createWorksheet(dataForExcel);

    // Enviamos por correo
    // await sendEmail(filename);

}

// Ejecutar todo el proceso
execute();