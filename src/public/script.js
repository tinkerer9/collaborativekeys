const socket = io();

var list = document.getElementById("list")

document.addEventListener("keydown", (e) => {
    socket.emit("keyPress", { key: e.key });
});

socket.on("keyPressEcho", function(e) {
    list.innerText += e;
})