/* This is the main JavaScript file that runs on the host's computer. */
const { Server } = require("socket.io");

/* Import other scripts we made to organize functions and more: */
const Client = require("./client");
const Key = require("./key");
const Type = require("./type");
const GameConsole = require("./console");
const Manager = require("./manager");
const Admin = require("./admin");
const Http = require("./http");

const server = Http.createServer();

// Helper Functions
function sendPopup(player, content) {
    player.getSocket().emit("PopupEvent", content)
}

function handleNameRes(player, ev) {
    switch (ev) {
        case 0:
            console.log(`Client ${player.getId()} name set to ${player.getName()}.`);
            sendPopup(player, "<li class='good'><b>Successfully set name to "  + player.getName() + ".</b></li>");
            player.getSocket().emit("actions","hideusernamebox");
            break;
        case 1:
            sendPopup(player, "<li class='bad'><b>Could not set name: Your name must be more than 3 characters long.</b></li>");
            break;
        case 2:
            sendPopup(player, "<li class='bad'><b>Could not set name: Your name must be shorter than 20 characters long.</b></li>");
            break;
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

            socket.emit("keyPressEcho", `<li><b>You pressed ${keyName}.</b><li>`); // send to playerrs
            socket.broadcast.emit("keyPressEcho", `<li>${player.getName()} pressed ${keyName}.</li>`); // send to other players

            if (keyNew) socket.emit("keyReserved", keyName);

            console.log(`Valid keypress from ${player.getName()} (player ${player.getId()}): ${keyName} (${keyData}).`);
        }
    } else {
        socket.emit("keyPressEcho", `<li style="color: red;"><b>${keyName} is already reserved.</b></li>`); // send to player
        console.log(`Invalid keypress from ${player.getName()} (player ${player.getId()}): ${keyName} (${keyData}).`);
    }
}

const io = new Server(server);
io.on("connection", (socket) => { // new client connected (non-admin)
    console.log("Namespace of socket:", socket.nsp.name); // debug

    socket.join("main");

    var player = new Client.Player(socket); // create player class
    var mid = Manager.addPlayer(player);
    console.log(`Player ${player.getId()} connected.`);

    socket.on("setName", (data) => {
        if (player.noNameSet()) {
            handleNameRes(player, player.setName(data));
        }
    });

    socket.on("keyPress", (data) => {
        handleKeyPress(socket, player, data);
    });

    socket.on("disconnect", () => { // client disconnected
        console.log(player.noNameSet() ? `Player ${player.getId()} disconnected.` : `${player.getName()} (player ${player.getId()}) disconnected.`);
        player.destroy();
        Key.freeAssignment(player.getId());
        Manager.removePlayer(mid);
    });
});

const admin = io.of("/admin"); // creats a namespace for just /admin
admin.on("connection", (socket) => { // new client connected (non-admin)
    console.log("Namespace of socket:", socket.nsp.name); // debug

    socket.join("admin");

    var admin = new Client.Admin(socket); // create admin class
    console.log(`Admin ${admin.getId()} connected.`);

    socket.on("disconnect", () => { // admin disconnected
        console.log(`Admin ${admin.getId()} disconnected.`);
        admin.destroy();
    });
});

server.listen(80, "0.0.0.0", () => { // Change port here
    console.log("Server running at localhost (port 80).");
});