// Se genera un array de fechas para iterarla en el main
function getDates(daysBack = 7) {
    const dates = [];
    for (let i = 0; i <= daysBack; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);        
        dates.push(d.toISOString().split('T')[0].replace(/-/g, ''));
    }
    return dates;
}

module.exports = { getDates };