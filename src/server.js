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
const Http = require("./http");
const Config = require("./config");

const server = Http.createServer();

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

function handleAuthRes(admin, ev) {
    if (ev) { // correct password entered
        log(`Admin ${admin.getId()} successfully authenticated.`);
        sendLog(admin, "<li class='good'><b>Successfully authenticated.</b></li>");
        admin.getSocket().emit("actions","hidepasswordbox");
        admin.getSocket().join("admin"); // add to admins room
    } else { // incorrect password entered
        sendLog(admin, "<li class='bad'><b>Incorrect password entered.</b></li>");
    }
}

function handleKeyPress(socket, player, data) {
    if (player.processChecks()) return;

    [keyAllowed, keyNew] = Key.keyAllowed(data.key, player.getId()); 

    let keyData = data.key
    let keyName = Type.nameKey(keyData);

    if (keyAllowed) { // if key allowed
        let keyValid = Type.keypress(keyData); // emulate keypress

        if (keyValid) { // if key is "pressable"
            sendLog(player, `<li><b>You pressed ${keyName}.</b><li>`); // send to player
            broadcastLog(player, `<li>${player.getName()} pressed ${keyName}.</li>`); // send to other clients

            if (keyNew) socket.emit("keyReserved", keyName);

            log(`Valid keypress from ${player.getName()} (player ${player.getId()}): ${keyName} (${keyData}).`);
        }
    } else {
        sendLog(player, `<li style="color: red;"><b>${keyName} is already reserved.</b></li>`); // send to player
        log(`Invalid keypress from ${player.getName()} (player ${player.getId()}): ${keyName} (${keyData}).`);
    }
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

const io = new Server(server);
io.on("connection", (socket) => { // new client connected (non-admin)

    var player = new Client.Player(socket); // create player class
    var mid = Manager.addPlayer(player);
    log(`Player ${player.getId()} connected.`);

    socket.on("setName", (data) => {
        if (player.noNameSet()) {
            handleNameRes(player, player.setName(data));
        }
    });

    /* To LethalShadowFlame:
    Do we really need a chat? This game is meant more for people in the same room looking at the same big screen.
    They can still talk to eachother.
    from Tinkerer9 */

    /*socket.on("chatMessage", (data) => {
        if (player.processChecks()) return;

        let message = "[" + player.getName() + "]: " + data
        io.emit("ChatMessageEcho", message);
        log(message)
    });*/

    socket.on("keyPress", (data) => {
        handleKeyPress(socket, player, data);
    });

    socket.on("disconnect", () => { // client disconnected
        log(player.noNameSet() ? `Player ${player.getId()} disconnected.` : `${player.getName()} (player ${player.getId()}) disconnected.`);
        player.destroy();
        Key.freeAssignment(player.getId());
        Manager.removePlayer(mid);
    });
});

const admin = io.of("/admin"); // creats a namespace for just /admin
admin.on("connection", (socket) => { // new client connected (non-admin)
    var admin = new Client.Admin(socket); // create admin class
    log(`Admin ${admin.getId()} connected.`);

    socket.on("authenticate", (data) => {
        if (!admin.isAuthenticated()) {
            handleAuthRes(admin, admin.authenticate(data == Config.adminPassword));
        }
    });

    socket.on("command", (data) => {
        if (!admin.isAuthenticated()) return;

        response = Console.handleCommand(data).replaceAll("\n", "<br>"); // handle command as if typed into console
        socket.emit("response", `<li><b>${data}</b>:<br>${response}<li>`);
    });

    socket.on("disconnect", () => { // admin disconnected
        log(`Admin ${admin.getId()} disconnected.`);
        admin.destroy();
    });
});

let serverPort = Config.serverPort;
server.listen(serverPort, "0.0.0.0", () => { // Change port here
    let localIP = getLocalIP();
    let portString = serverPort == 80 ? "" : ":" + serverPort;
    let uri = localIP + portString;

    log(`Server running at ${uri}.`);
    log(`Admin controls at ${uri}/admin.`);
});