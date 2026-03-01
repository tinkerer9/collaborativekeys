/* This script manages which keys are assigned to each player */

let keyAssignments = {}; // key = charachter, value = socket.id

function assignKey(key, id) {
    keyAssignments[key] = id;
}
function isAssignedKey(key, id) {
    return keyAssignments[key] == id;
}
function keyIsAssigned(key) {
    return key in keyAssignments;
}
function keyAllowed(key, id) {
    if (keyIsAssigned(key)) {
        if (isAssignedKey(key, id)) {
            return true;
        } else {
            return false;
        }
    } else {
        assignKey(key, id);
        return true;
    }    
}
function freeAssignment(id) {
    for (const key in keyAssignments) {
        if (keyAssignments[key] == id) {
            delete keyAssignments[key];
        }
    }
}

module.exports = { keyAllowed, freeAssignment }; 