/*!
 *  CollaboKeys: a collaborative keyboard game
 *  Copyright (C) 2026  @tinkerer9 and @LethalShadowFlame
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/* Manages players globally. */

const players = {};

module.exports = {
    getPlayerCount: function() {
        return Object.keys(players).length;
    },
    addPlayer: function(pid, player) {
        players[pid] = player;
    },
    getPlayerByPid: function(pid) {
        return players[pid];
    },
    removePlayer: function(pid) {
        delete players[pid];
    },
    isPlayer: function(pid) {
        return pid in players;
    },
    getAllPlayers: function() {
        return Object.values(players);
    },
    getPlayerByPname: function(name) {
        for (const [key, value] of Object.entries(players)) {
            if (value.getName() == name) return value.getPlayerId;
        }
    }
};