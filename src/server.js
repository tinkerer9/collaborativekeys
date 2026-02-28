const http = require("http");
const fs = require("fs");
const path = require("path");
const { Server } = require("socket.io");
const Client = require("./client");
const Key = require("./key");

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

const io = new Server(server);

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    var player = new Client(socket, "Test");
    socket.on("setName", (data) => {
        
    })
    socket.on("keyPress", (data) => {
        if (Key.keyAllowed(data.key, socket.id)) {
            socket.emit("keyPressEcho", `${socket.id} pressed <b>${data.key}</b><br>`); // send to clients
            console.log(`Valid keypress from ${socket.id}: ${data.key}`);
        } else {
            console.log(`Inalid keypress from ${socket.id}: ${data.key}`);
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        player.destroy();
        Key.freeAssignment(socket.id);
    });
});

server.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});