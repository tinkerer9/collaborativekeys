/* This script manages which keys are assigned to each player */

let keyAssignments = {}; // key = charachter, value = player.getId()

let m = {}

m.assignKey = function(key, id) {
    keyAssignments[key] = id;
}
m.isAssignedKey = function(key, id) {
    return keyAssignments[key] == id;
}
m.keyIsAssigned = function(key) {
    return key in keyAssignments;
}
m.keyAllowed = function(key, id) { // returns if key is allowed to be pressed and if was unreserved
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
m.freeAssignment = function(id) {
    for (const key in keyAssignments) {
        if (keyAssignments[key] == id) {
            delete keyAssignments[key];
        }
    }
}

module.exports = m; 