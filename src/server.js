const http = require("http");
const fs = require("fs");
const path = require("path");
const { Server } = require("socket.io");
const Client = require("./client");
const Key = require("./key");
const Room = require("./room");
const Type = require("./type");

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
            sendPopup(player, "<li><b>Successfully set name to "  + player.getName() + ".</b></li>");
            player.getSocket().emit("actions","hideusernamebox");
            break;
        case 1:
            sendPopup(player, "<li style='color: red;'><b>Could not set name: Your name must be more than 3 characters long.</b></li>");
            break;
        case 2:
            sendPopup(player, "<li style='color: red;'><b>Could not set name: Your name must be shorter than 20 characters long.</b></li>");
            break;
    }
    sendPopup(player, toSend)
}

const io = new Server(server);

io.on("connection", (socket) => {
    var player = new Client(socket, "Test");

    console.log(`Player ${player.getId()} connected.`);

    socket.on("setName", (data) => {
        if (player.noNameSet()) {
            handleNameRes(player, player.setName(data));
        }
    })

    socket.on("keyPress", (data) => {
        if (player.noNameSet()) { return; }

        if (Key.keyAllowed(data.key, player.getId())) {
            socket.emit("keyPressEcho", `<li><b>You pressed ${data.key}.</b><li>`); // send to client
            socket.broadcast.emit("keyPressEcho", `<li>${player.getName()} pressed ${data.key}.</li>`); // send to others
            console.log(`Valid keypress from ${player.getName()} (player ${player.getId()}): ${data.key}`);

            Type.keypress(data.key);

        } else {
            socket.emit("keyPressEcho", `<li styles="color: red;"><b>${data.key} is already reserved.</b></li>`); // send to clients
            console.log(`Inalid keypress from ${player.getName()} (player ${player.getId()}): ${data.key}`);
        }
    });

    socket.on("disconnect", () => {
        console.log(`Player ${player.getId()} disconnected.`);
        player.destroy();
        Key.freeAssignment(player.getId());
    });
});

server.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
