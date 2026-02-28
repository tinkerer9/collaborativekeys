const socket = io();

var list = document.getElementById("list")
var input = document.getElementById("i")
var confrm = document.getElementById("confirm")

document.addEventListener("keydown", (e) => {
    socket.emit("keyPress", { key: e.key });
});

socket.on("keyPressEcho", function(e) {
    list.innerHTML += e;
})
socket.on("PopupEvent", function(e) {
    list.innerHTML += e;
})

confrm.onclick = function() {
    var i = input.value
    socket.emit("setName", i)
}