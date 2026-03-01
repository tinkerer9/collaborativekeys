/* This script manages metadata about each player. */

const DEFAULT_NAME = null;
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
    }
    getSocket() {
        return this.socket;
    }
    getName() {
        return this.name;
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
        return this.id
    }
}

module.exports = Client;