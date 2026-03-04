const socket = io("/admin");

const authentication = document.getElementsByClassName("authentication")[0];
const input = document.getElementById("input");
const enter = document.getElementById("enter");
const controlButtons = document.getElementsByClassName("controlButtons")[0];
const logList = document.getElementById("logList");
const responsesList = document.getElementById("responsesList");
const contentHeaders = document.getElementsByClassName("contentHeaders");

input.focus(); // immediately focus textbox

enter.onclick = function() {
    socket.emit("authenticate", input.value);
}

input.addEventListener("keypress", function(event) {
  if (event.key == "Enter") {
    event.preventDefault();
    enter.click(); // simulate click on enter button
  }
});

socket.on("actions", function(e) {
    if (e == "hidepasswordbox") { // when password entered successfully
        authentication.style.display = 'none';
        controlButtons.style.display = 'block';
        for (let contentHeader of contentHeaders) {
            contentHeader.style.display = 'block';
        }
    }
});

socket.on("log", function(e) {
    prependToLogList(e);
});

socket.on("response", function(e) {
    prependToResponseList(e);
});

socket.on("connect_error", (error) => {
    socket.disconnect();
    console.error("Connection error:", error.message);

    prependToLogList("<li style='color: red;'><b>Failed to connect to the server.<br>Please reload or try again.</b></li>");
});

function prependToLogList(message) {
    logList.insertAdjacentHTML('afterbegin', message);
}

function prependToResponseList(message) {
    responsesList.insertAdjacentHTML('afterbegin', message);
}