/*!
 *  CollaboKeys: a collaborative keyboard game
 *  Copyright (C) 2026  @tinkerer9 and @LethalShadowFlame
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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

/* Helper Functions */

function sendLog(client, content) {
    client.socket.emit("log", content);
}

function broadcastLog(client, content) {
    client.socket.broadcast.emit("log", content);
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
            log(`Client ${player.id} name set to ${player.getName()}.`);
            sendLog(player, "<li class='good'><b>Successfully set name to "  + player.getName() + ".</b></li>");
            player.socket.emit("actions","hideusernamebox");
            break;
        case 1: // name too short
            sendLog(player, "<li class='bad'><b>Could not set name: Your name must be more than 3 characters long.</b></li>");
            break;
        case 2: // name too long
            sendLog(player, "<li class='bad'><b>Could not set name: Your name must be shorter than 20 characters long.</b></li>");
            break;
    }
}

function handleAuthRes(admin, data, override) {
    if (data == Config.adminPassword || override) { // correct password entered
        admin.authenticate();
        log(`Admin ${admin.id} successfully authenticated.`);
        sendLog(admin, "<li class='good'><b>Successfully authenticated.</b></li>");
        admin.socket.emit("actions","hidepasswordbox");
        admin.socket.join("admin"); // add to admins room (only for authenticated admins)
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

    [keyAllowed, keyNew] = Key.keyAllowed(keyData, player.id); 

    if (!keyAllowed) { // if key already assigned
        sendLog(player, `<li style="color: red;"><b>${keyName} is already reserved.</b></li>`); // send to player
        return;
    }

    if (keyNew) socket.emit("keyReserved", keyName);

    sendLog(player, `<li><b>You pressed ${keyName}.</b><li>`); // send to player
    broadcastLog(player, `<li>${player.getName()} pressed ${keyName}.</li>`); // send to other clients

    Type.keypress(keyData); // emulate keypress

    log(`Valid keypress from ${player.getName()} (${player.id}): ${keyName}.`);
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
    var pid = player.id;
    Manager.addPlayer(pid, player);

    log(`Player ${pid} connected.`);

    socket.emit("id", pid);

    socket.on("setName", (data) => {
        if (player.noNameSet()) {
            handleNameRes(player, player.setName(data));
        }
    });

    socket.on("keyPress", (data) => {
        log("ee");
        handleKeyPress(socket, player, data);
    });

    socket.on("disconnect", () => { // client disconnected
        log(player.noNameSet() ? `Player ${pid} disconnected.` : `${player.getName()} (player ${pid}) disconnected.`);
        player.destroy();
        Key.freeAssignment(pid);
        Manager.removePlayer(pid);
    });
});

const admin = io.of("/admin"); // creats a namespace for just /admin
admin.on("connection", (socket) => { // new client connected (non-admin)
    var admin = new Client.Admin(socket); // create admin class
    var aid = admin.id;

    log(`Admin ${aid} connected.`);

    if (Config.adminPassword == "") handleAuthRes(admin, null, true); // auto auth if password is blank

    socket.on("authenticate", (data) => {
        if (admin.authenticated) return;

        handleAuthRes(admin, data, false);
    });

    socket.on("command", (data) => {
        if (!admin.authenticated) return;

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
