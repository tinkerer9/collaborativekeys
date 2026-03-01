/* This is the main JavaScript file that runs on the host's computer. */

const http = require("http");
const fs = require("fs");
const path = require("path");
const { Server } = require("socket.io");

/* Other scripts we made to organize functions and more: */
const Client = require("./client");
const Key = require("./key");
const Type = require("./type");

const publicDir = path.join(__dirname, "public");

const server = http.createServer((req, res) => {
    // Default to index.html if requesting / (root)
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

// Helper Functions
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
            let keyName = Type.keypress(data.key); // emulate keypress and get name

            if (keyName != undefined) {
                socket.emit("keyPressEcho", `<li><b>You pressed ${data.key}.</b><li>`); // send to player
                socket.broadcast.emit("keyPressEcho", `<li>${player.getName()} pressed ${data.key}.</li>`); // send to other players
            }
            console.log(`Valid keypress from ${player.getName()} (player ${player.getId()}): ${keyName} (${data.key}).`);

        } else {
            socket.emit("keyPressEcho", `<li styles="color: red;"><b>${data.key} is already reserved.</b></li>`); // send to player
            console.log(`Inalid keypress from ${player.getName()} (player ${player.getId()}): ${data.key}`);
        }
    });

    socket.on("disconnect", () => {
        console.log(`${player.getName()} (player ${player.getId()}) disconnected.`);
        player.destroy();
        Key.freeAssignment(player.getId());
    });
});

server.listen(80, () => {
    console.log("Server running at localhost (port 80).");
});
