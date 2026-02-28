const http = require("http");
const fs = require("fs");
const path = require("path");
const { Server } = require("socket.io");

const server = http.createServer((req, res) => {
    // Serve index.html for /
    let filePath = path.join(__dirname, "index.html");
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(500);
            return res.end("Error loading index.html");
        }
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
    });
});

const io = new Server(server);

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("keyPress", (data) => {
        socket.emit("keyPressEcho", `Key pressed from ${socket.id}:`, data.key);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

server.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});