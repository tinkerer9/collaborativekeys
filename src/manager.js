/* Manages players globally. */
let m = {}

var list = [];

m.getPlayerCount = function() {
    return list.length;
}
m.addPlayer = function(player) {
    list.push(player)
    return m.getPlayerCount() - 1; // return index of new player
}
m.getPlayerById = function(id) {
    return list[id];
}

m.removePlayer = function(id) {
    list[id] = undefined;
}

m.isPlayer = function(id) {
    return !(list[id] == undefined);
}

module.exports = m;