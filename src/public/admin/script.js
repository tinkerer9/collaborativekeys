const socket = io("/admin");

socket.on("connect", () => {
    console.log("Connected:", socket.id, socket.nsp.name); // should be "/admin"
});

const logHeader = document.getElementById("logHeader");
const logList = document.getElementById("logList");

socket.on("log", function(e) {
    prependToLogList(e);
});

socket.on("connect_error", (error) => {
    socket.disconnect();
    console.error("Connection error:", error.message);

    prependToLogList("<li style='color: red;'><b>Failed to connect to the server.<br>Please reload or try again.</b></li>");
});

function prependToLogList(message) {
    logList.insertAdjacentHTML('afterbegin', message);
}