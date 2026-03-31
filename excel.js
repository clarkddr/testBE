const logger = require('./logger');
const ExcelJS = require('exceljs');
const fs = require('fs');

async function createWorksheet(data) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte de Viajes');
    
    const finalData = (data && data.length > 0) 
        ? data 
        : [];

    // Se mapean los campos que entrega la API a nombres legibles segun la especificación.
    worksheet.columns = [
        { header: 'External ID', key: 'PRUEBA', width: 15 },
        { header: 'Identifier 1', key: 'NoViajeCliente', width: 15 },
        { header: 'Truck Number', key: 'CodigoUnidadCamion', width: 15 },
        { header: 'Trailer Number', key: 'CodigoUnidadCarga1', width: 15 },
        { header: 'Located At', key: 'FechaHoraEstatuViaje', width: 25 },
        { header: 'Status Reason Code', key: 'NS', width: 10 },
        // Se pueden agregar los siguientes campos para comprobacion
        { header: 'ClientID', key: 'IdCliente', width: 10 },
        { header: 'Salida', key: 'Salida', width: 25 },
        { header: 'Llegada', key: 'Llegada', width: 25 }
    ];

    // Agregar los datos
    worksheet.addRows(finalData);

    // Formato de cabecera
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' } 
    };

    // 4. Guardar el archivo
    try {
        const dir = './files';
        // Verificar si la carpeta existe, si no, crearla
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        const filename = `${dir}/Reporte_Viajes_${Date.now()}.xlsx`;
        await workbook.xlsx.writeFile(filename);
        logger.info(`Archivo generado con éxito: ${filename}`);
        return filename;
    } catch (error) {
        logger.error(`Error al escribir el Excel: ${error.message}.`);
    }
}

module.exports = createWorksheet;