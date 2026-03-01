const socket = io();

const naming = document.getElementsByClassName("naming")[0];
const input = document.getElementById("input");
const enter = document.getElementById("enter");
const logList = document.getElementById("logList");
const keysHeader = document.getElementById("keysHeader");
const keysList = document.getElementById("keysList");

input.focus(); // immediately focus textbox

input.addEventListener('input', () => {
  input.value = input.value.replace(/[^a-zA-Z0-9]/g, '');
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

        naming.style.display = 'none';
        keysHeader.style.display = 'block';
    }
});

socket.on("keyPressEcho", function(e) {
    prependToLogList(e);
})
socket.on("PopupEvent", function(e) {
    prependToLogList(e);
})
socket.on("keyReserved", function(e) {
    appendToKeyList(e);
})

function prependToLogList(message) {
    logList.insertAdjacentHTML('afterbegin', message);
}

function appendToKeyList(key) {
    const newItem = document.createElement("li");
    const itemText = document.createTextNode(key);
    
    newItem.appendChild(itemText);
    keysList.appendChild(newItem);
}