const socket = io();

const naming = document.getElementsByClassName("naming")[0];
const input = document.getElementById("input");
const enter = document.getElementById("enter");
const logHeader = document.getElementById("logHeader");
const logList = document.getElementById("logList");
const contentHeaders = document.getElementsByClassName("contentHeaders");

var allowKeyPresses = false;
// var inputFocus = "NAME"

/* To LethalShadowFlame:
See my comment on server.js on why we don't need a chat.
from Tinkerer9 */

document.addEventListener("keydown", (e) => {
    if (allowKeyPresses) socket.emit("keyPress", { key: e.key });
});

input.focus(); // immediately focus textbox

input.addEventListener('input', () => {
  input.value = input.value.replace(/[^a-zA-Z0-9]/g, '');
});


enter.onclick = function() {
    /*switch (inputFocus) {
        case "NAME":*/
            socket.emit("setName", input.value);
            /*inputFocus = "CHAT"
            input.value = ""
            break;
        case "CHAT":
            socket.emit("chatMessage", input.value)
            input.value = "";
            break;*/
    }
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
    /*if (e == "swapToChat") {
        input.placeHolder = "Chat..."
    }*/
});

socket.on("keyPressEcho", function(e) {
    prependToLogList(e);
});

socket.on("PopupEvent", function(e) {
    prependToLogList(e);
});

/*socket.on("ChatMessageEcho", function(e) {
    let chatelem = document.createElement("li"); // could still run HTML code in chat on other clients?
    logList.prepend(chatelem);
    chatelem.innerText = e;
});*/


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