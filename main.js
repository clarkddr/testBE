const getData = require('./data');
const createWorksheet = require('./excel');
const sendEmail = require('./email');
const getDates = require('./dates');
const logger = require('./logger');
const fs = require('fs');


// Función principal que ejecuta todo el proceso
async function execute() {
    // Obtenemos array de fechas de hace 7 días para enviarla a la api. 
    logger.info(`--- Iniciando proceso de obtención de datos ---`);
    const dates = getDates();
    logger.info(`Se intentará obtener registros de las fechas: ${dates}`);
    // Obtenemos registros de la API dia por dia, iterando en dates 
    let rows = [];
    // TODO: Enviar esta funcion fuera de execute()
    for (const date of dates) {
        logger.info(`Consultando: ${date}`);
        try {
            // llamamos a la función que obtiene los datos de la API, pasándole la fecha
            const response = await getData(date);
            // Verificamos la respuesta de la API, si es un array con datos, lo agregamos a rows,
            //  si no, mostramos un mensaje de que no hubo datos para esa fecha
            if (Array.isArray(response) && response.length > 0) {
                rows.push(...response);                
                logger.info(`Agregados ${response.length} registros.`);
            } else {
                logger.info(`No hubo viajes en la fecha ${date}`);
            }
        } catch (error) {
            logger.error(`Error en fecha ${date}: ${error.message}.`);
        }
    }


    // Si no hay datos después de la consulta, terminamos
    if (!rows || rows.length === 0) {
        logger.warn("No se obtuvieron registros de la API.");
        return;
    }

    // Filtramos los resultados conforme lo solicitado, IdCliente == 402 
    // y Salida con valor, Llegada sin valor.

    // TODO: Sacar el StartsWith y hacer en Utils "IsValidDate()" || ClientToFilter = 402;
    logger.info(`--- Aplicando filtros a los datos obtenidos ---`);   
    const filteredRows = rows.filter(row => 
        row.IdCliente == 402 && 
        !row.Salida.startsWith('0000')  &&
        row.Llegada.startsWith('0000') 
    );
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
    const filename = await createWorksheet(filteredRows);
    if (!filename) {
        logger.error("El generador de Excel no devolvió un nombre de archivo. Cancelando envío.");
        return;
    }  

    // Enviamos por correo
    await sendEmail(filename);

    // Eliminamos el archivo
    await deleteFile(filename);
    

}


// TODO: Enviar a utils
async function deleteFile(filename) {
    try {
        await fs.promises.unlink(filename);
        logger.info(`Archivo ${filename} eliminado exitosamente.`);
    } catch (error) {
        logger.error(`Error al eliminar el archivo ${filename}: ${error.message}`);
    }
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