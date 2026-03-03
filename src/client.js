/* This script manages metadata about each player. */

const FALLBACK_NAME = "No Name"; //Used if the player has not set a name yet
const ADMIN_THRESHOLD = 1;

let maxPlayerId = 0; // increments every time

function hasNoAlphabeticalChars(str) {
    return !/[a-zA-Z0-9]/.test(str);
}

class Player {
    constructor(socket, pl) {
        this.socket = socket;
        this.name = null; // null as preset for unnamed
        this.id = maxPlayerId++;

        /* flags */
        this.waitingRoom = true;
        this.permission = pl;
    }
    getSocket() {
        return this.socket;
    }
    getName() {
        return this.name || FALLBACK_NAME; // returns FALLBACK_NAME if no name is set
    }
    setName(name) {
        /* name must be between 3 and 20 chars long */
        if (name.length < 3) return 1
        if (name.length > 20) return 2
        if (hasNoAlphabeticalChars(name)) return 3
        this.name = name;
        return 0;
    }
    destroy() {
        // doesn't do anything yet
    }
    noNameSet() {
        return this.name == null; // if no name set
    }
    getId() {
        return this.id; // all players have an id, regardless if they are named or not.
    }
    message(txt) {
        this.getSocket().emit("ChatMessageEcho", txt);
    }
    admit() {
        this.waitingRoom = false;
    }
    dismiss() {
        this.waitingRoom = true;
    }
    inWaitingRoom() {
        return this.waitingRoom;
    }
    processChecks() { // if player allowed to type
        return !this.noNameSet() && this.inWaitingRoom();
    }
    isAdmin() {
        return this.pl > ADMIN_THRESHOLD;
    }
    permissionLevel() {
        return this.pl;
    }
}

module.exports = Player;