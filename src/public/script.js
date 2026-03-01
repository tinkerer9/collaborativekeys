const socket = io();

var list = document.getElementById("list")
var input = document.getElementById("input")
var enter = document.getElementById("enter")
var pf = document.getElementById("playframe")


input.addEventListener('input', () => {
  input.value = input.value.replace(/[^a-zA-Z0-9_-]/g, '');
});

enter.onclick = function() {
    var username = input.value;
    socket.emit("setName", username);
}

function reloadPF() {
    pf.contentWindow.location.reload();
}

socket.on("actions", function(e) {
    switch (e) {
        case "hideusernamebox":
            document.addEventListener("keydown", (e) => {
                socket.emit("keyPress", { key: e.key });
            });

            input.style.display = "none";
            enter.style.display = "none";
        case "reloadPlay":
            reloadPF()
    }
});

document.addEventListener("keyup", (e) => {
    socket.emit("keyPress", { key: e.key });
});

socket.on("keyPressEcho", function(e) {
    prependToList(e);
})
socket.on("PopupEvent", function(e) {
    prependToList(e);
})
socket.on("setFrameLocation", function(e) {
    pf.contentWindow.location.set
})

function prependToList(message) {
    list.insertAdjacentHTML('afterbegin', message);
}