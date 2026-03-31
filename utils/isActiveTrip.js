function isActiveTrip(row){
    const emptyDate = "0000-00-00T00:00:00.000";
    const hasLeft = row.Salida !== emptyDate;
    const hasNotArrived = row.Llegada == emptyDate;
    return hasLeft && hasNotArrived;
}

module.exports = isActiveTrip;