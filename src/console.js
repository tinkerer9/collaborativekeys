const readline = require('readline');

const COMMAND_ARG_SEP = " "

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function log(a) {
    console.log(a); //in case this should do extra like send to clients or whatever
}

function spliceCommand(input) {
    return input.split(COMMAND_ARG_SEP);
}

function getCommand(arr) {
    return arr[0];
}

function getArguments(arr) {
    return arr.slice(1, arr.length);
}

function fallback(args) {
    log("Unrecognized command. Please try again.")
}

function waitingRoom(args) {

};

function listHandle(args) {
    
};

function keyHandle(args) {

};

function commandCallbacks(cmd) {
    switch (cmd) {
        case "stop":
            return endRl;
        case "exit":
            return endRl;
        case "waitingroom":
            return waitingRoom;
        case "wr":
            return waitingRoom;
        case "list":
            return listHandle;
        case "ls":
            return listHandle;
        case "key":
            return keyHandle;
        case "k":
            return keyHandle;
        default:
            return fallback;
    }
}

function handleCommand(input) {
    let cmdArr = spliceCommand(input);
    commandCallbacks(getCommand(cmdArr))(getArguments(cmdArr));
}

function endRl() {
    log("Ending process.")
    rl.close();
    process.exit();
}

//Listeners
process.on('SIGINT', endRl);
process.on('SIGTERM', endRl);
rl.on('line', handleCommand)