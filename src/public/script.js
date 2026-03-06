const socket = io();

const naming = document.getElementsByClassName("naming")[0];
const input = document.getElementById("input");
const enter = document.getElementById("enter");
const logList = document.getElementById("logList");
const contentHeaders = document.getElementsByClassName("contentHeaders");

var allowKeyPresses = false; // also does check on server-side

document.addEventListener("keydown", (e) => {
    if (allowKeyPresses && e !== "Shift") socket.emit("keyPress", { key: e.key });
});

input.focus(); // immediately focus textbox

input.addEventListener('input', () => {
    input.value = input.value.replace(/[^a-zA-Z0-9]/g, '');
});


enter.onclick = function() {
    socket.emit("setName", input.value);
}

input.addEventListener("keypress", function(event) {
  if (event.key == "Enter") {
    event.preventDefault();
    enter.click(); // simulate click on enter button
  }
});

socket.on("actions", function(e) {
    if (e == "hideusernamebox") { // when name entered successfully
        allowKeyPresses = true;
        naming.style.display = 'none';
        for (let contentHeader of contentHeaders) {
            contentHeader.style.display = 'block';
        }
    }
});

socket.on("log", function(e) {
    prependToLogList(e);
});

socket.on("keyReserved", function(e) {
    appendToKeyList(e);
});

socket.on("connect_error", (error) => {
    socket.disconnect();
    console.error("Connection error:", error.message);

    prependToLogList("<li style='color: red;'><b>Failed to connect to the server.<br>Please reload or try again.</b></li>");
});

function prependToLogList(message) {
    logList.insertAdjacentHTML('afterbegin', message);
}

function appendToKeyList(key) {
    const newItem = document.createElement("li");
    const itemText = document.createTextNode(key);
    
    newItem.appendChild(itemText);
    keysList.appendChild(newItem);
}