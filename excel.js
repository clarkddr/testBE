const ExcelJS = require('exceljs');

async function createWorksheet(data) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte de Viajes');
    
    const finalData = (data && data.length > 0) 
        ? data 
        : [];

    // 1. Definir Columnas
    worksheet.columns = [
        { header: 'ClientID', key: 'IdCliente', width: 15 },
        { header: 'External ID', key: 'PRUEBA', width: 15 },
        { header: 'Identifier 1', key: 'NoViajeCliente', width: 25 },
        { header: 'Truck Number', key: 'CodigoUnidadCamion', width: 20 },
        { header: 'Trailer Number', key: 'CodigoUnidadCarga1', width: 20 },
        { header: 'Located At', key: 'FechaHoraEstatuViaje', width: 20 },
        { header: 'Status Reason Code', key: 'NS', width: 25 },
        { header: 'Salida', key: 'Salida', width: 25 },
        { header: 'Llegada', key: 'Llegada', width: 25 }
    ];

    // 2. Agregar los datos
    worksheet.addRows(finalData);

    // 3. Formato de cabecera
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' } 
    };

    // 4. Guardar el archivo
    try {
        const filename = `./files/Reporte_Viajes_${Date.now()}.xlsx`;
        await workbook.xlsx.writeFile(filename);
        console.log(`Archivo generado con éxito: ${filename}`);
        return filename;
    } catch (error) {
        console.error("Error al escribir el Excel:", error.message);
    }
}

module.exports = { createWorksheet };