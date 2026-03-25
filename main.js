const getData = require('./data');
const createWorksheet = require('./excel');
const sendEmail = require('./email');
const getDates = require('./dates');
const logger = require('./logger');

async function execute() {
    // Obtenemos array de fechas de hace 7 días para enviarla a la api. 
    logger.info(`--- Iniciando proceso de obtención de datos ---`);
    const dates = getDates();
    logger.info(`Se obtendrán registros de las fechas: ${dates}`);

    // Obtenemos registros de la API dia por dia, iterando en dates 
    let rows = [];
    for (const date of dates) {
        logger.info(`Consultando: ${date}`);
        try {
            const response = await getData(date);
            // Verificamos la respuesta
            if (Array.isArray(response) && response.length > 0) {
                rows.push(...response);                
                logger.info(`Agregados ${response.length} viajes.`);
            } else {
                logger.info(`No hubo viajes en la fecha ${date}`);
            }
        } catch (error) {
            logger.error(`Error en fecha ${date}: ${error.message}.`);
        }
    }

    // Si no hay datos, terminamos
    if (!rows || rows.length === 0) {
        logger.warn("No se obtuvieron registros de la API.");
        return;
    }

    // Filtramos los resultados conforme lo solicitado, IdCliente == 402 
    // y Salida con valor, Llegada sin valor.
    logger.info(`--- Aplicando filtros a los datos obtenidos ---`);   
    const filteredRows = rows.filter(row => 
        row.IdCliente == 402 &&
        !row.Salida.startsWith('0000')  &&
        row.Llegada.startsWith('0000') 
    );    
    logger.info(`Se obtuvieron ${filteredRows.length} registros.`);

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
    await sendEmail(filename);

}

// Ejecutar todo el proceso
execute();