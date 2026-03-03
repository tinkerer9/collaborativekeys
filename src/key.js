/* This script manages which keys are assigned to each player */

let keyAssignments = {}; // key = charachter, value = player.getId()

function assignKey(key, id) {
    keyAssignments[key] = id;
}
function isAssignedKey(key, id) {
    return keyAssignments[key] == id;
}
function keyIsAssigned(key) {
    return key in keyAssignments;
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
    for (const key in keyAssignments) {
        if (keyAssignments[key] == id) {
            delete keyAssignments[key];
        }
    }
}

module.exports = { keyAllowed, freeAssignment }; 