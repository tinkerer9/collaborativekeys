//Handles console commands
const readline = require('readline');
const Manager = require('./manager')

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

function logPlayerInfo(player, showWait) {
    let pa = player.getSocket().handshake.address;
    log("Client ID " + player.getId() + ":")
    log("Name: " + player.getName())
    log("IP: " + pa)
    if (showWait) log("In Waiting Room: " + player.inWaitingRoom()); //Used to hide waiting room info if filtered by waiting room
    log("") //Clean up (will print a newline, see definition)
}

function waitingRoom(args) {

};

function listHandle(args) {
    let pc = Manager.getPlayerCount();
    let filterBy = args[0] || "active";
    let showWait = !(filterBy == "wr" || filterBy == "waitingroom")

    log("");

    for (let i = 0; i < pc; i++) {
        logPlayerInfo(Manager.getPlayerById(i), showWait);
    }
    log("Logged all player information.")
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
rl.on('SIGINT', endRl);
rl.on('SIGTERM', endRl);
rl.on('line', handleCommand)