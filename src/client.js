/* This script manages metadata about each player. */

const Config = require("./config.json");

const FALLBACK_NAME = "No Name"; // Used if the player has not set a name yet

let maxPlayerId = 0; // increments every time
let maxAdminId = 0; // increments every time

function hasNoAlphabeticalChars(str) {
    return !/[a-zA-Z0-9]/.test(str);
}

class Player {
    constructor(socket) {
        this.socket = socket;
        this.name = null; // null as preset for unnamed
        this.id = maxPlayerId++;

        /* flags */
        this.waitingRoom = Config.waitRoomPlayersWhenJoined;
    }
    getName() {
        return this.name || FALLBACK_NAME; // returns FALLBACK_NAME if no name is set
    }
    setName(name) {
        /* name must be between 3 and 20 chars long */
        if (name.length < 3) return 1;
        if (name.length > 20) return 2;
        if (hasNoAlphabeticalChars(name)) return 3;
        this.name = name;
        return 0;
    }
    destroy() {
        // doesn't do anything yet
    }
    noNameSet() {
        return this.name == null; // if no name set
    }
    message(txt) {
        this.socket.emit("log", `<li><b>${txt}</b></li>`);
    }
    admit() {
        this.waitingRoom = false;
    }
    dismiss() {
        this.waitingRoom = true;
    }
    processChecks() { // if player allowed to type
        return !this.noNameSet() && this.waitingRoom;
    }
}

class Admin {
    constructor(socket) {
        this.socket = socket;
        this.id = maxAdminId++;

        /* flags */
        this.authenticated = false;
    }
    destroy() {
        // doesn't do anything yet
    }
    authenticate(correctPassword) {
        this.authenticated = true;
    }
    message(txt) {
        this.socket.emit("log", txt);
    }
}

module.exports = { Player, Admin };