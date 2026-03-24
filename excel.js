const ExcelJS = require('exceljs');

async function createWorksheet(data) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte de Viajes');

    // --- DATOS DUMMY (Por si acaso) ---
    const finalData = (data && data.length > 0) 
        ? data 
        : [];

    // 1. Definir Columnas
    worksheet.columns = [
        { header: 'ID Viaje', key: 'IdViaje', width: 15 },
        { header: 'No. Viaje Cliente', key: 'NoViajeCliente', width: 25 },
        { header: 'Unidad', key: 'CodigoUnidadCamion', width: 20 },
        { header: 'Fecha Salida', key: 'Salida', width: 25 }
    ];

    // 2. Agregar los datos
    worksheet.addRows(finalData);

    // 3. Formato visual básico (Para que no se vea "crudo")
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' } // Gris claro
    };

    // 4. Guardar el archivo
    try {
        const filename = `./files/Reporte_Viajes_${Date.now()}.xlsx`;
        await workbook.xlsx.writeFile(filename);
        console.log(`✅ Archivo generado con éxito: ${filename}`);
        return filename;
    } catch (error) {
        console.error("❌ Error al escribir el Excel:", error.message);
    }
}

module.exports = { createWorksheet };