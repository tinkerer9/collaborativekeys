const http = require("http");
const fs = require("fs");
const path = require("path");
const { Server } = require("socket.io");
const Client = require("./client");
const Key = require("./key")
const messages = require("./messages")

const publicDir = path.join(__dirname, "public");

const server = http.createServer((req, res) => {
    // Default to index.html if requesting /
    let filePath = path.join(publicDir, req.url === "/" ? "index.html" : req.url);

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

//Helper Functions
function sendPopup(player, content) {
    player.getSocket().emit("PopupEvent", content)
}

function handleNameRes(player, ev) {
    let toSend = "";
    switch (ev) {
        case 0:
            toSend = messages.nameSetSuccessStart + player.getName();
            break;
        case 1:
            toSend = messages.minName
            break;
        case 2:
            toSend = messages.maxName
            break;
        case 3:
            toSend = messages.disallowedChar
            break;
    }
    sendPopup(player, toSend)
}

function nameWall(player) {
    if (player.noNameSet()) {
        sendPopup(player, messages.noName)
        return true
    }
    return false
}

const io = new Server(server);

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    var player = new Client(socket, "Test");

    socket.on("setName", (data) => {
        if (player.noNameSet()) {
            handleNameRes(player, player.setName(data));
        } else {
            sendPopup(player, messages.nameSet)
        }
    })

    socket.on("keyPress", (data) => {
        if (data.length != 1) return
        if (nameWall(player)) return

        if (Key.keyAllowed(data.key, player.id)) {
            io.emit("keyPressEcho", `${player.id} pressed <b>${data.key}</b>.<br>`); // send to clients
            socket.broadcast.emit("keyPressEcho", `<li>${socket.id} pressed ${data.key}.</li>`); // send to others
            console.log(`Valid keypress from ${player.id}: ${data.key}`)
        } else {
            socket.emit("keyPressEcho", `<b>${data.key}` + messages.reserved); // send to clients
            console.log(`Inalid keypress from ${player.id}: ${data.key}`);
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", player.id);
        player.destroy();
        Key.freeAssignment(socket.id);
    });
});

server.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
