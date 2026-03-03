/* This is the main JavaScript file that runs on the host's computer. */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { Server } = require("socket.io");

/* Import other scripts we made to organize functions and more: */
const Client = require("./client");
const Key = require("./key");
const Type = require("./type");
const GameConsole = require("./console");
const Manager = require("./manager");

const publicDir = path.join(__dirname, "public");

const server = http.createServer((req, res) => {
    // Default to index.html if requesting / (root)
    let filePath = path.join(publicDir, req.url == "/" ? "index.html" : req.url);

    // Determine content type
    const extname = path.extname(filePath);
    let contentType = "text/plain";

    switch (extname) {
        case ".html": contentType = "text/html"; break;
        case ".js": contentType = "application/javascript"; break;
        case ".css": contentType = "text/css"; break;
        case ".png": contentType = "image/png"; break;
        case ".jpg": contentType = "image/jpeg"; break;
        case ".gif": contentType = "image/gif"; break;
        case ".ico": contentType = "image/x-icon"; break;
    }

    // Read the file
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end("File not found");
            return;
        }
        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
    });
});

// Helper Functions
function sendPopup(player, content) {
    player.getSocket().emit("PopupEvent", content)
}

function handleNameRes(player, ev) {
    switch (ev) {
        case 0:
            console.log(`Client ${player.getId()} name set to ${player.getName()}.`);
            sendPopup(player, "<li style='color: green;'><b>Successfully set name to "  + player.getName() + ".</b></li>");
            player.getSocket().emit("actions","hideusernamebox");
            break;
        case 1:
            sendPopup(player, "<li style='color: red;'><b>Could not set name: Your name must be more than 3 characters long.</b></li>");
            break;
        case 2:
            sendPopup(player, "<li style='color: red;'><b>Could not set name: Your name must be shorter than 20 characters long.</b></li>");
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

            if (keyNew) {
                socket.emit("keyReserved", keyName);
            }

            console.log(`Valid keypress from ${player.getName()} (client ${player.getId()}): ${keyName} (${keyData}).`);
        }
    } else {
        socket.emit("keyPressEcho", `<li style="color: red;"><b>${keyName} is already reserved.</b></li>`); // send to player
        console.log(`Invalid keypress from ${player.getName()} (client ${player.getId()}): ${keyName} (${keyData}).`);
    }
}

const io = new Server(server);

io.on("connection", (socket) => { // new client connected
    var player = new Client(socket, "Test"); // create player class
    var mid = Manager.addPlayer(player);
    console.log(`Client ${player.getId()} connected.`);

    socket.on("setName", (data) => {
        if (player.noNameSet()) {
            handleNameRes(player, player.setName(data));
        }
    })

    socket.on("keyPress", (data) => {
        handleKeyPress(socket, player, data);
    });

    socket.on("disconnect", () => { // client disconnected
        console.log(player.noNameSet() ? `Client ${player.getId()} disconnected.` : `${player.getName()} (client ${player.getId()}) disconnected.`);
        player.destroy();
        Key.freeAssignment(player.getId());
        Manager.removePlayer(mid);
    });
});

server.listen(80, "0.0.0.0", () => { // Change port here
    console.log("Server running at localhost (port 80).");
});