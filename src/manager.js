/* Manages players globally. */

const players = {};

function getPlayerCount() {
    return Object.keys(players).length;
}
function addPlayer(pid, player) {
    players[pid] = player;
}
function getPlayerByPid(pid) {
    return players[pid];
}
function removePlayer(pid) {
    delete players[pid];
}
function isPlayer(pid) {
    return pid in players;
}
function getAllPlayers() {
    return Object.values(players);
}

module.exports = { players, getPlayerCount, addPlayer, getPlayerByPid, removePlayer, isPlayer, getAllPlayers };