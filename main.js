const getData = require('./data');
const createWorksheet = require('./excel');
const sendEmail = require('./email');
const getDates = require('./dates');
const logger = require('./logger');
const deleteFile = require('./utils/deleteFile');
const isActiveTrip = require('./utils/isActiveTrip');



// Función principal que ejecuta todo el proceso
async function execute() {
    // Asignamos el IdCliente del que se hará el filtro. 
    const IdCliente = 402;
    
    // Obtenemos array de fechas de hace 7 días para enviarla a la api. 
    logger.info(`--- Iniciando proceso de obtención de datos ---`);
    const dates = getDates();
    logger.info(`Se intentará obtener registros de las fechas: ${dates}`);
    
    
    // Obtenemos registros de la API dia por dia, iterando en dates 
    const rows = await fetchAllTripsByDateRange(dates);
    // Si no hay datos después de la consulta, terminamos
    if (!rows || rows.length === 0) {
        logger.warn("No se obtuvieron registros de la API.");
        return;
    }

    // Filtramos los resultados conforme lo solicitado, IdCliente == 402 
    // y Salida con valor, Llegada sin valor.    
    logger.info(`--- Aplicando filtros a los datos obtenidos ---`);   
    const filteredRows = rows.filter(trip => trip.IdCliente == IdCliente && isActiveTrip(trip));
    
    // Si después de filtrar no hay datos, terminamos
    if (filteredRows.length === 0) {
        logger.warn("No hay viajes activos para el cliente. Nada que enviar.");
        return;
    }    
    logger.info(`Se obtuvieron ${filteredRows.length} registros.`);

    // Ordenamos el listado
    filteredRows.sort((a,b) => {
        return new Date(b.Salida) - new Date(a.Salida)
    });

    // Se genera el archivo excel llamando la funcion y pasamos el array filtrado, 
    // la función devuelve el nombre del archivo generado, si no se genera, termina el proceso
    const filename = await createWorksheet(rows);
    if (!filename) {
        logger.error("El generador de Excel no devolvió un nombre de archivo. Cancelando envío.");
        return;
    }  

    // Enviamos por correo
    await sendEmail(filename);

    // Eliminamos el archivo
    await deleteFile(filename);
    

}

async function fetchAllTripsByDateRange(dates) {
    let allRows = [];
    
    for (const date of dates) {
        logger.info(`Consultando fecha: ${date}`);
        try {
            const response = await getData(date);
            
            if (Array.isArray(response) && response.length > 0) {
                allRows.push(...response);                
                logger.info(`Agregados ${response.length} registros para la fecha ${date}.`);
            } else {
                logger.info(`Sin registros en la fecha ${date}`);
            }
        } catch (error) {
            // Importante: No lanzamos el error (throw) para que el bucle 
            // pueda intentar con la siguiente fecha si una falla.
            logger.error(`Fallo crítico al consultar la fecha ${date}: ${error.message}`);
        }
    }
    
    return allRows;
}



async function startScheduler() {
    while (true) {
        logger.info("=== Iniciando nuevo proceso ===");        
        await execute();         
        logger.info("Proceso finalizado. Esperando 15 minutos para la siguiente ejecución...");                
        await new Promise(resolve => setTimeout(resolve, 15 * 60 * 1000));
    }
}

startScheduler();