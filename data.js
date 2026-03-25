const logger = require('./logger');
const axios = require('axios');
require('dotenv').config();

async function getData(dFecha) {    
     const url = 'https://gmterpv8-51.gmtransport.co/GMTERPV8_PROCESOSESPECIALES_WEB/ES/API.awp'; 

    // El API espera los parámetros en formato x-www-form-urlencoded
    const params = new URLSearchParams();
    params.append('OutputFormat', 'JSON');    
    // params.append('RFCEmpresa', process.env.RFC_EMPRESA);
    params.append('ApiKey', process.env.API_KEY);
    params.append('Parametros', JSON.stringify({
        "Clase": "ClsProViajes",
        "Metodo": "GetEntregasSeguimiento",
        "Parametros": { "dFecha": dFecha }
    }));

    try {
        const res = await axios.post(url, params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        // Agregamos los campos fijos "PRUEBA" y "NS" a cada registro, como se solicitó
        const data = res.data.Result.Viajes.map(row=> ({
            ...row,
            "PRUEBA" : "PRUEBA",
            "NS" : "NS"            
        }));
        return data;
    } catch (error) {
        const errorDetails = error.response ? error.response.status : error.message;
        logger.error(`Error: ${errorDetails}.`);
        return [];
    }
}

module.exports = getData;