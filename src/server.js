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
const License = require("./license");
const GameIo = require("./io");
const Utils = require("./utils");

/* Helper Functions */
function sendLog(client, content, format) {
    switch (format) {
        case "success":
            content = `<li class="good"><b>${content}</b></li>`; // success logs are always bolded
            break;
        case "error":
            content = `<li class="bad"><b>${content}</b></li>`; // error logs are always bolded
            break;
        case "bold":
            content = `<li><b>${content}</b></li>`;
            break;
        default: // if format empty or invalid
            content = `<li>${content}</li>`
    }

    client.socket.emit("log", content);
}

function broadcastLog(client, content) {
    client.socket.broadcast.emit("log", `<li>${content}</li>`); // no need to format, as always normal formatting
}

function sendGlobalLog(content) { // to everyone
    io.emit("log", `<li>${content}</li>`);  // no need to format, as always normal formatting
}

function log(content) {
    console.log(content);

    admin.in("admin").emit("log", `<li>${content}</li>`);  // no need to format, as always normal formatting
}

function handleNameRes(player, ev) {
    switch (ev) {
        case 0: // valid name entered
            log(`Client ${player.id} name set to ${player.getName()}.`);
            sendLog(player, "Successfully set name to "  + player.getName() + ".", "success");
            player.socket.emit("actions","hideusernamebox");
            break;
        case 1: // name too short
            sendLog(player, "Could not set name: Your name must be more than 3 characters long.", "error");
            break;
        case 2: // name too long
            sendLog(player, "Could not set name: Your name must be shorter than 20 characters long.", "error");
            break;
    }
}

function handleAuthRes(admin, data, override) {
    if (data == Config.adminPassword || override) { // correct password entered
        admin.authenticate();
        log(`Admin ${admin.id} successfully authenticated.`);
        sendLog(admin, "Successfully authenticated.", "success");
        admin.socket.emit("actions","hidepasswordbox");
        admin.socket.join("admin"); // add to admins room (only for authenticated admins)
    } else { // incorrect password entered
        sendLog(admin, "Incorrect password entered.", "error");
    }
}


function handleKeyPress(socket, player, data) {
    if (!Type.allowEmulation) {
        sendLog(player, "Emulation is disabled by admin.", "error"); // send to player
        return;
    }

    if (player.processChecks()) return; // only allows players that are named and not waitroomed to press keys

    let keyData = data.key;

    if (!Type.keyExists(keyData)) {
        sendLog(player, `${keyData} is not supported.`, "error"); // send to player
        return;
    }

    let keyName = Type.keyName(keyData);

    if (!Type.keyEnabled(keyData)) {
        sendLog(player, `${keyName} is disabled by admin.`, "error"); // send to player
        return;
    }

    [keyAllowed, keyNew] = Key.keyAllowed(keyData, player.id); 

    if (!keyAllowed) { // if key already assigned
        sendLog(player, `${keyName} is already reserved.`, "error"); // send to player
        return;
    }

    if (keyNew) socket.emit("keyReserved", keyName);

    sendLog(player, `You pressed ${keyName}.`, "bold"); // send to player
    broadcastLog(player, `${player.getName()} pressed ${keyName}.`); // send to other clients

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

console.log(License.terminalNotice); // log GNU GPLv3 terminal notice

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

function handleAdminConnection(socket) {
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
        socket.emit("response", `<li><b>${data}:</b><br>${response}</li>`);
    });

    socket.on("disconnect", () => { // admin disconnected
        log(`Admin ${aid} disconnected.`);
        admin.destroy();
    });
}

//Will disable Admin connections

if (!Config.allowRemoteConsole) handleAdminConnection = function(socket) {socket.emit("noAdmin")};

admin.on("connection", handleAdminConnection);

let serverPort = Config.serverPort;
server.listen(serverPort, "0.0.0.0", () => {
    let localIP = getLocalIP(); // Computers each have multiple IPs/hostnames.
    let portString = serverPort == 80 ? "" : ":" + serverPort;
    let uri = localIP + portString;

    log(`Server running at ${uri}.`);
    log(`Admin controls at ${uri}/admin.`);
});
