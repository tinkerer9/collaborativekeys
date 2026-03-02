/* This script manages metadata about each player. */

let maxId = 0; // increments every time

function hasNoAlphabeticalChars(str) {
    return !/[a-zA-Z0-9]/.test(str);
}

class Client {
    constructor(socket) {
        this.socket = socket;
        this.name = null; // null as preset for unnamed
        this.id = maxId++;

        /* flags */
        this.waitingRoom = true; // future-proofing
    }
    getSocket() {
        return this.socket;
    }
    getName() {
        return this.name;
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
    /* FUTURE-PROOFING:
    admit() {
        this.waitingRoom = false;
    }
    dismiss() {
        this.waitingRoom = true;
    }
    inWaitingRoom() {
        return this.waitingRoom;
    }*/
    processChecks() { // if player allowed to type
        return this.inWaitingRoom() || this.noNameSet();
    }
    
}

module.exports = Client;