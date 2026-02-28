const http = require("http");
const fs = require("fs");
const path = require("path");
const { Server } = require("socket.io");

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

    socket.on("keyPress", (data) => {
        socket.emit("keyPressEcho", `Key pressed from ${socket.id}: <b>${data.key}</b>`); // send to clients
        console.log(`Key pressed from ${socket.id}: ${data.key}`);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

server.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});