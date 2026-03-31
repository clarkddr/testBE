const fs = require('fs');
const logger = require('../logger');

async function deleteFile(filename) {
    try {
        await fs.promises.unlink(filename);
        logger.info(`Archivo ${filename} eliminado exitosamente.`);
    } catch (error) {
        logger.error(`Error al eliminar el archivo ${filename}: ${error.message}`);
    }
}

module.exports = deleteFile;

