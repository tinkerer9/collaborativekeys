/* This script manages metadata about each player. */

const DEFAULT_NAME = null;
const PLACEHOLDER_NAME = "No Name";
const MIN_NAME_LEN = 3;
const MAX_NAME_LEN = 20;

let maxId = 0;

function hasNoAlphabeticalChars(str) {
    return !/[a-zA-Z0-9]/.test(str);
}

class Client {
    constructor(socket) {
        this.socket = socket;
        this.name = DEFAULT_NAME;
        this.id = maxId++;

        // flags
        this.canChat = true; // future proofing
        this.waitingRoom = true;
    }
    getSocket() {
        return this.socket;
    }
    getName() {
        return this.name || PLACEHOLDER_NAME;
    }
    setName(name) {
        if (name.length < MIN_NAME_LEN) return 1
        if (name.length > MAX_NAME_LEN) return 2
        if (hasNoAlphabeticalChars(name)) return 3
        this.name = name;
        return 0;
    }
    destroy() {
        // doesn't do anything yet
    }
    noNameSet() {
        return this.name == DEFAULT_NAME;
    }
    getId() {
        return this.id || -1;
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
    processChecks() {
        return this.inWaitingRoom() || this.noNameSet();
    }
    
}

module.exports = Client;