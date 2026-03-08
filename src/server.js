/* This is the main JavaScript file that runs on the host's computer. */

/* Import modules used directly by server.js */
const { Server } = require("socket.io");
const os = require('os');

/* Import other scripts we made to organize functions and more: (have other modules as well) */
const Client = require("./client");
const Key = require("./key");
const Type = require("./type");
const Console = require("./console");
const Manager = require("./manager");
const Router = require("./router");
const Config = require("./config.json");
const keyListener = fork('./keyListener.js');

/* Helper Functions */

function sendLog(client, content) {
    client.getSocket().emit("log", content);
}

function broadcastLog(client, content) {
    client.getSocket().broadcast.emit("log", content);
}

function sendGlobalLog(content) { // to everyone
    io.emit("log", content);
}

function log(content) {
    console.log(content);

    admin.in("admin").emit("log", `<li>${content}</li>`);
}

function handleNameRes(player, ev) {
    switch (ev) {
        case 0: // valid name entered
            log(`Client ${player.getId()} name set to ${player.getName()}.`);
            sendLog(player, "<li class='good'><b>Successfully set name to "  + player.getName() + ".</b></li>");
            player.getSocket().emit("actions","hideusernamebox");
            //player.getSocket().emit("actions","swapToChat");
            break;
        case 1: // name too short
            sendLog(player, "<li class='bad'><b>Could not set name: Your name must be more than 3 characters long.</b></li>");
            break;
        case 2: // name too long
            sendLog(player, "<li class='bad'><b>Could not set name: Your name must be shorter than 20 characters long.</b></li>");
            break;
    }
}

function handleAuthRes(admin, data) {
    if (data == Config.adminPassword) { // correct password entered
        admin.authenticate();
        log(`Admin ${admin.getId()} successfully authenticated.`);
        sendLog(admin, "<li class='good'><b>Successfully authenticated.</b></li>");
        admin.getSocket().emit("actions","hidepasswordbox");
        admin.getSocket().join("admin"); // add to admins room (only for authenticated admins)
    } else { // incorrect password entered
        sendLog(admin, "<li class='bad'><b>Incorrect password entered.</b></li>");
    }
}

function handleKeyPress(socket, player, data) {
    if (!Type.allowEmulation) {
        sendLog(player, `<li style="color: red;"><b>Emulation is disabled by admin.</b></li>`); // send to player
        return;
    }

    if (player.processChecks()) return; // only allows players that are named and not waitroomed to press keys

    let keyData = data.key;

    if (!Type.keyExists(keyData)) {
        sendLog(player, `<li style="color: red;"><b>${keyData} is not supported.</b></li>`); // send to player
        return;
    }

    let keyName = Type.keyName(keyData);

    if (!Type.keyEnabled(keyData)) {
        sendLog(player, `<li style="color: red;"><b>${keyName} is disabled by admin.</b></li>`); // send to player
        return;
    }

    [keyAllowed, keyNew] = Key.keyAllowed(keyData, player.getId()); 

    if (!keyAllowed) { // if key already assigned
        sendLog(player, `<li style="color: red;"><b>${keyName} is already reserved.</b></li>`); // send to player
        return;
    }

    if (keyNew) socket.emit("keyReserved", keyName);

    sendLog(player, `<li><b>You pressed ${keyName}.</b><li>`); // send to player
    broadcastLog(player, `<li>${player.getName()} pressed ${keyName}.</li>`); // send to other clients

    Type.keypress(keyData); // emulate keypress

    log(`Valid keypress from ${player.getName()} (${player.getId()}): ${keyName}.`);
}

function getLocalIP() {
    const networkInterfaces = os.networkInterfaces();
    let localIP;
    
    // Iterate over network interfaces to find the non-internal IPv4 address
    Object.keys(networkInterfaces).forEach((ifname) => {
        networkInterfaces[ifname].forEach((iface) => {
            if ('IPv4' !== iface.family || iface.internal !== false) return; // skip internal (i.e. 127.0.0.1) and non-IPv4 addresses
            localIP = iface.address;
        });
    });

    return localIP;
}

const server = Router.createServer();
const io = new Server(server);
io.on("connection", (socket) => { // new client connected (non-admin)
    var player = new Client.Player(socket); // create player class
    var pid = player.getId();
    var mid = Manager.addPlayer(pid, player);

    log(`Player ${pid} connected.`);

    socket.on("setName", (data) => {
        if (player.noNameSet()) {
            handleNameRes(player, player.setName(data));
        }
    });

    socket.on("keyPress", (data) => {
        handleKeyPress(socket, player, data);
    });

    socket.on("disconnect", () => { // client disconnected
        log(player.noNameSet() ? `Player ${pid} disconnected.` : `${player.getName()} (player ${pid}) disconnected.`);
        player.destroy();
        Key.freeAssignment(pid);
        Manager.removePlayer(mid);
    });
});

const admin = io.of("/admin"); // creats a namespace for just /admin
admin.on("connection", (socket) => { // new client connected (non-admin)
    var admin = new Client.Admin(socket); // create admin class
    var aid = admin.getId();

    log(`Admin ${aid} connected.`);

    socket.on("authenticate", (data) => {
        if (admin.isAuthenticated()) return;

        handleAuthRes(admin, data);
    });

    socket.on("command", (data) => {
        if (!admin.isAuthenticated()) return;

        response = Console.handleCommand(data).replaceAll("\n", "<br>"); // handle command as if typed into console
        socket.emit("response", `<li><b>${data}</b>:<br>${response}<li>`);
    });

    socket.on("disconnect", () => { // admin disconnected
        log(`Admin ${aid} disconnected.`);
        admin.destroy();
    });
});

let serverPort = Config.serverPort;
server.listen(serverPort, "0.0.0.0", () => {
    let localIP = getLocalIP();
    let portString = serverPort == 80 ? "" : ":" + serverPort;
    let uri = localIP + portString;

    log(`Server running at ${uri}.`);
    log(`Admin controls at ${uri}/admin.`);
});

