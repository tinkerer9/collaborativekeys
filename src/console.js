/* Handles console commands */

const readline = require('readline');
const Manager = require('./manager');
const Type = require('./type');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let logList = []; // log that is sent out to console and admin page

function isInt(a) { // Easier to type
    return Number.isInteger(a);
}

function log(a) {
    logList.push(a);
}

function spliceCommand(input) {
    return input.split(" ");
}

function getCommand(arr) {
    return arr[0];
}

function getArguments(arr) {
    return arr.slice(1, arr.length);
}

function fallback(args) {
    log("Unrecognized command. Please try again.");
}

function processToLog(player, filter) {
    // Returns true if should print, false if should filter.
    if (player == null) return false;
    switch (filter) {
        case "all":
            return true;
        case "wr":
            return player.inWaitingRoom();
        case "active":
            return !player.inWaitingRoom() && !player.noNameSet();
        case "nameless":
            return player.noNameSet();
        default:
            // Invalid filter
            return false;
    }
}

function waitingRoom(args) {
    let action = args[0] || null;
    let pid = args[1] || null;

    // Check if allowed (easier to read as one line)
    if ((action == null) || isInt(pid)) {
        log("You need to provide more arguments! Usage: waitingroom <admit/dismiss> <id>");
        return;
    }
    if (!Manager.isPlayer(pid)) {
        log("Invalid player, did you mistype the id?");
        return
    };

    // Setup more vars now that check has passed
    let player = Manager.getPlayerByPid(pid);

    // Use switch statement so if more options added later they'll be easier to implement
    switch (action) {
        case "admit":
            player.admit();
            player.message("You have been admitted from the waiting room!");
            log("Admitted " + player.getName());
            break;
        case "dismiss":
            player.dismiss();
            player.message("You have been dismissed to the waiting room.");
            log("Dismissed " + player.getName());
            break;
        default:
            log("Invalid method, did you misspell the first argument?");
            return;
    }
};

function pauseEmulation() {
    Type.allowEmulation = false;
    log("Emulation disabled.");
}

function resumeEmulation() {
    Type.allowEmulation = true;
    log("Emulation enabled.");
}


function listHandle(args) {
    // Setup vars
    let filterBy = args[0] || "all";
    if (filterBy == "waitingroom") filterBy = "wr";
    
    let showWait = filterBy !== "wr";

    log("");

    Manager.getAllPlayers().forEach(player => {
        if (!processToLog(player, filterBy)) return;
        log("Client ID " + player.getId() + ":");
        log("Name: " + player.getName());
        log("IP: " + player.getSocket().handshake.address);
        if (showWait) log(player.inWaitingRoom() ? "In waiting room" : "Not in waiting room" );
        log("");
    });

    log("Logged all player information.");
};

function keyHandle(args) {
    
};

function commandCallbacks(cmd) {
    switch (cmd) {
        case "stop":
            return endRl; break;
        case "exit":
            return endRl; break;
        case "waitingroom":
            return waitingRoom; break;
        case "wr":
            return waitingRoom; break;
        case "list":
            return listHandle; break;
        case "ls":
            return listHandle; break;
        case "key":
            return keyHandle; break;
        case "k":
            return keyHandle; break;
        case "pause":
            return pauseEmulation; break;
        case "resume":
            return resumeEmulation; break;
        default:
            return fallback;
    }
}

function handleCommand(input) { // for in console only
    logList = []; // reset log

    let cmdArr = spliceCommand(input);
    commandCallbacks(getCommand(cmdArr))(getArguments(cmdArr));

    let logText = logList.join('\n'); // join log lines together into one string
    console.log(logText);
    return logText; // for admin page
}

function endRl() {
    log("Ending process.");
    rl.close();
    process.exit();
}

// Listeners
rl.on('SIGINT', endRl);
rl.on('SIGTERM', endRl);
rl.on('line', handleCommand);

module.exports = { handleCommand }; // for admin page