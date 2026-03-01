const socket = io();

var list = document.getElementById("list")
var input = document.getElementById("input")
var enter = document.getElementById("enter")
var pf = document.getElementById("playframe")
var hideAfterNaming = document.getElementsByClassName("hideAfterNaming");
var showAfterNaming = document.getElementsByClassName("showAfterNaming");


input.addEventListener('input', () => {
  input.value = input.value.replace(/[^a-zA-Z0-9_-]/g, '');
});

enter.onclick = function() {
    var username = input.value;
    socket.emit("setName", username);
}

input.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    enter.click();
  }
});

socket.on("actions", function(e) {
    if (e == "hideusernamebox") {
        document.addEventListener("keydown", (e) => {
            socket.emit("keyPress", { key: e.key });
        });

        for (const element of hideAfterNaming) {
            element.style.display = 'none';
        }
        for (const element of showAfterNaming) {
            element.style.display = 'block';
        }
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