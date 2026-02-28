const DEFAULT_NAME = ""
const MIN_NAME_LEN = 1
const MAX_NAME_LEN = 10

var rid = 0

function hasNoAlphabeticalChars(str) {
    return !/[a-zA-Z0-9]/.test(str);
}

class Room {
    constructor() {
        this.name = DEFAULT_NAME;
        this.id = rid++
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
    emitTo(io, data) {
        io.in(this.getId()).emit(data);
    }
    emitTo(io, data, arg) {
        io.in(this.getId()).emit(data, arg);
    }
}