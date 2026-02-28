const DEFAULT_NAME = null
const MIN_NAME_LEN = 3
const MAX_NAME_LEN = 20

var maxId = 0

class Client {
    constructor(socket) {
        this.socket = socket
        this.name = DEFAULT_NAME
        this.id = maxId++
        this.assignedKey = null
        //Flags
        
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
        this.name = name;
        return 0;
    }
    destroy() {
        //Do something at some point :)
    }
    isNameChanged() {
        return !(this.name == DEFAULT_NAME);
    }
    getKey() {
        return this.assignedKey;
    }
    setKey(key) {
        this.assignedKey = key;
    }
    isKey(key) {
        return this.assignedKey == key;
    }
}

module.exports = Client;