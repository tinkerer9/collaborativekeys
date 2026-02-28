const http = require("http");
const fs = require("fs");
const path = require("path");
const { Server } = require("socket.io");
const Client = require("./client");
const Key = require("./key")
const messages = require("./messages")

const publicDir = path.join(__dirname, "public");

let keyAssignments = {}; // key = charachter, value = socket.id

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
    switch (ev) {
        case 0:
            sendPopup(player, messages.nameSetSuccessStart + player.getName());
            break;
        case 1:
            sendPopup(player, messages.minName);
            break;
        case 2:
            sendPopup(player, messages.maxName);
            break;
    }
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
    var player = new Client(socket, "Test");

    socket.on("setName", (data) => {
        if (player.noNameSet()) {
            handleNameRes(player, player.setName(data));
        } else {
            sendPopup(player, messages.nameSet)
        }
    })

    socket.on("keyPress", (data) => {
        nameWall()
        key = data.key;

        if (keyAllowed(key, socket.id)) {
            socket.emit("keyPressEcho", `${socket.id} pressed <b>${key}</b><br>`); // send to clients
            console.log(`Valid keypress from ${socket.id}: ${key}`);
        } else {
            console.log(`Inalid keypress from ${socket.id}: ${key}`);
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        player.destroy();
    });
});

server.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});

function assignKey(key, id) {
    keyAssignments[key] = id;
}
function isAssignedKey(key, id) {
    return keyAssignments[key] == id;
}
function keyIsAssigned(key) {
    return key in keyAssignments;
}
function keyAllowed(key, id) {
    if (keyIsAssigned(key)) {
        if (isAssignedKey(key, id)) {
            return true;
        } else {
            return false;
        }
    } else {
        assignKey(key, id);
        return true;
    }    
}

// function assignKey(key, id) {
//     keyAssignments[key] = id;
// }
// function isAssignedKey(key, id) {
//     return keyAssignments[key] == id;
// }
// function keyIsAssigned(key) {
//     return key in keyAssignments;
// }
// function keyAllowed(key, id) {
//     if (keyIsAssigned(key)) {
//         if (isAssignedKey(key, id)) {
//             return true;
//         } else {
//             return false;
//         }
//     } else {
//         assignKey(key, id);
//         return true;
//     }    
// }
