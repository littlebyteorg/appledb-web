module.exports = function formatDeviceName(n) {
    return n
    .replace(/ /g, '-')
    .replace(/\//g,'%2F')
    .replace(/ü/g,'u')
    .replace(/²/g,'2')
    .replace(/³/g,'3')
};