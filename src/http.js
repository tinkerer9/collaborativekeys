/* Create the HTTP server */

const http = require("http");
const fs = require("fs");
const path = require("path");

const publicDir = path.join(__dirname, "public");

const mimeTypes = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".gif": "image/gif",
  ".json": "application/json"
};

function createServer() {
    const publicDir = path.join(__dirname, "public");

    const server = http.createServer((req, res) => {
        let requestPath = decodeURIComponent(req.url.split("?")[0]);

        // Default to root
        if (requestPath === "/") requestPath = "/index.html";

        let filePath = path.join(publicDir, requestPath);

        // Check if path exists
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);

            if (stats.isDirectory()) {
                // Ensure URL ends with slash
                if (!req.url.endsWith("/")) {
                    res.writeHead(301, { Location: req.url + "/" });
                    res.end();
                    return;
                }

                // Serve index.html in the folder
                filePath = path.join(filePath, "index.html");
            }
        } else {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("File not found");
            return;
        }

        // Determine content type
        const ext = path.extname(filePath).toLowerCase();
        let contentType = mimeTypes[ext] || "text/plain";

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Server error");
                return;
            }
            res.writeHead(200, { "Content-Type": contentType });
            res.end(data);
        });
    });

    return server;
}

module.exports = { createServer };