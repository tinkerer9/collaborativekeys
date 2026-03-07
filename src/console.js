/* Handles console commands */

const readline = require('readline');
const Manager = require('./manager');
const Type = require('./type');
const Key = require('./key');

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

function endRl() {
    // stop
    
    log("Ending process.");
    rl.close();
    process.exit();
}

function waitingRoom(args) {
    // waitingroom <admit/dismiss> <id/all>

    let action = args[0] || null;
    let pid = args[1] || null;
    if (pid == "all") pid = -1;

    // Check if allowed (easier to read as one line)
    if (action == null) {
        log("You need to provide more arguments (action)! Usage: waitingroom <admit/dismiss> <id>");
        return;
    }
    if (pid !== -1 && !Manager.isPlayer(pid)) {
        log("Invalid player, did you mistype the id?");
        return;
    };

    // Setup more vars now that check has passed
    let players = pid == -1 ? Manager.getAllPlayers() : [Manager.getPlayerByPid(pid)];

    // Use switch statement so if more options added later they'll be easier to implement
    switch (action) {
        case "admit":
            players.forEach(player => {
                player.admit();
                player.message("You have been admitted from the waiting room.");
                log("Admitted " + player.getName());
            });
            break;
        case "dismiss":
            players.forEach(player => {
                player.dismiss();
                player.message("You have been dismissed from the waiting room.");
                log("Dismissed " + player.getName());
            });
            break;
        default:
            log("Invalid method, did you misspell the first argument?");
            return;
    }
};

function pauseEmulation() {
    // pause
    
    Type.allowEmulation = false;
    log("Emulation disabled.");
}

function resumeEmulation() {
    // resume

    Type.allowEmulation = true;
    log("Emulation enabled.");
}


function listHandle(args) {
    // list <active/wr/waitingroom/all/nameless>

    // Setup vars
    let filterBy = args[0] || "all";
    if (filterBy == "waitingroom") filterBy = "wr";
    
    let showWait = filterBy !== "wr";

    numPlayers = Manager.getPlayerCount();

    if (numPlayers == 0) {
        log("No players connected");
        return;
    }

    Manager.getAllPlayers().forEach((player, index) => {
        if (!processToLog(player, filterBy)) return;
        log(`Client ID ${player.getId()}:`);
        log(`Name: ${player.getName()}`);
        log(`IP: ${player.getSocket().handshake.address}`);
        if (showWait) log(`Waiting room: ${player.inWaitingRoom() ? "yes" : "no"}`);
        if (index !== numPlayers - 1) log("---");
    });
};

function keyHandle(args) {
    // key <revoke/enable/disable> <name/all>

    let action = args[0] || null;
    let key = args[1] || null;

    if (action == null) {
        log("You need to provide more arguments (action)! Usage: key <assign/revoke/enable/disable> <name/all>");
        return;
    }
    if (key !== "all" && (key == null || !Type.keyExists(key))) {
        log("Invalid key, did you mistype the key name?");
        return;
    };

    switch (action) {
        case "revoke":
            Key.revokeKey(key);
            log(`${key} revoked from all players.`);
            break;
        case "enable":
            if (key == "all") {
                Type.enableAllKeys();
                log("All keys enabled.");
            } else {
                Type.enableKey(key);
                log(`${key} enabled.`);
            }
            break;
        case "disable":
            if (key == "all") {
                Type.disableAllKeys();
                log("All keys disabled.");
            } else {
                Type.disableKey(key);
                log(`${key} disabled.`);
            }
            break;
        default:
            log("Invalid method, did you misspell the first argument?");
            return;
    }
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
    return logText; // for admin page
}

function handleConsoleCommand(input) {
    console.log(handleCommand(input));
}

// Listeners
rl.on('SIGINT', endRl);
rl.on('SIGTERM', endRl);
rl.on('line', handleConsoleCommand);

module.exports = { handleCommand }; // for admin page