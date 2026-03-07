/* This script manages which keys are assigned to each player */

const Keycodes = require("./keycodes");

function assignKey(key, id) {
    Keycodes[key][4] = id;
}
function isAssignedKey(key, id) {
    return Keycodes[key][4] == id;
}
function keyIsAssigned(key) {
    return Keycodes[key][4] !== null;
}

function keyAllowed(key, id) { // returns if key is allowed to be pressed and if was unreserved
    if (keyIsAssigned(key)) {
        if (isAssignedKey(key, id)) {
            return [true, false];
        } else {
            return [false, false];
        }
    } else {
        assignKey(key, id); // assign and allow
        return [true, true];
    }    
}

function freeAssignment(id) {
    Object.keys(Keycodes).forEach(key => {
        if (Keycodes[key][4] == id) {
            Keycodes[key][4] = null;
        }
    });
}

function revokeKey(key) {
    assignKey(key, null);
}

module.exports = { assignKey, keyAllowed, freeAssignment, revokeKey }; 