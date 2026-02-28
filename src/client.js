const DEFAULT_NAME = null
const MIN_NAME_LEN = 3
const MAX_NAME_LEN = 20
const ALLOWED_CHAR = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "1", "2", "3","4","5","6","7","8","9","0"];

var maxId = 0

function hasNoAlphabeticalChars(str) {
    return !/[a-zA-Z0-9]/.test(str);
}

class Client {
    constructor(socket) {
        this.socket = socket
        this.name = DEFAULT_NAME
        this.id = maxId++

        //Flags
        this.canChat = true
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
        //Do something at some point :)
    }
    noNameSet() {
        return this.name == DEFAULT_NAME;
    }
    getId() {
        return this.id
    }
}

module.exports = Client;