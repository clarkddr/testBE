const logger = require('./logger');
const axios = require('axios');
require('dotenv').config();

async function getData(dFecha) {    
     const url = 'https://gmterpv8-51.gmtransport.co/GMTERPV8_PROCESOSESPECIALES_WEB/ES/API.awp'; 

    const params = new URLSearchParams();
    params.append('OutputFormat', 'JSON');
    params.append('RFCEmpresa', process.env.RFC_EMPRESA);
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
        return res.data.Result.Viajes;
    } catch (error) {
        const errorDetails = error.response ? error.response.status : error.message;
        logger.error(`Error: ${errorDetails}.`);
        return [];
    }
}

module.exports = getData;