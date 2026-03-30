// Se genera un array de fechas en formato YYYYMMDD como la necesita la API.
function getDates(days = 7) {
    const dates = [];
    for (let i = 0; i < days; i++) {
        const now = new Date();
        now.setDate(now.getDate() - i);       
        
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); 
        const day = String(now.getDate()).padStart(2, '0');
        
        const formattedDate = `${year}${month}${day}`;
        dates.push(formattedDate);
    }
    return dates;
}
module.exports = getDates;