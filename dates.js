// Se genera un array de fechas en formato YYYYMMDD como la necesita la API.
function getDates(daysBack = 6) {
    const dates = [];
    for (let i = 0; i <= daysBack; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);       
        
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0'); 
        const day = String(d.getDate()).padStart(2, '0');
        
        const formattedDate = `${year}${month}${day}`;
        dates.push(formattedDate);
    }
    return dates;
}
module.exports = getDates;