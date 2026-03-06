const socket = io("/admin");

const authentication = document.getElementsByClassName("authentication")[0];
const input = document.getElementById("input");
const enter = document.getElementById("enter");
const controlButtons = document.getElementsByClassName("controlButtons")[0];
const logList = document.getElementById("logList");
const responsesList = document.getElementById("responsesList");
const contentHeaders = document.getElementsByClassName("contentHeaders");

const customCommandText = document.getElementById("customCommandText");
const customCommand = document.getElementById("customCommand");
const stopCommand = document.getElementById("stopCommand");
const pauseCommand = document.getElementById("pauseCommand");
const resumeCommand = document.getElementById("resumeCommand");
const wrCommand = document.getElementById("wrCommand");
const wrCommandArg0 = document.getElementById("wrCommandArg0");
const wrCommandArg1 = document.getElementById("wrCommandArg1");

input.focus(); // immediately focus textbox

enter.onclick = function() {
    socket.emit("authenticate", input.value);
};

input.addEventListener("keypress", function(event) {
    if (event.key == "Enter") {
        event.preventDefault();
        enter.click(); // simulate click on enter button
    }
});

/* COMMAND FUNCTIONS */

customCommand.onclick = function() {
    command(customCommandText.value);
    customCommandText.value = "";
};
customCommandText.addEventListener("keypress", function(event) {
    if (event.key == "Enter") {
        event.preventDefault();
        customCommand.click(); // simulate click on enter button
    }
});
stopCommand.onclick = function() {
    command("stop");
};
pauseCommand.onclick = function() {
    command("pause");
};
resumeCommand.onclick = function() {
    command("resume");
};
wrCommand.onclick = function() {
    command("waitingroom", wrCommandArg0.value, wrCommandArg1.value);
    wrCommandArg1.value = "";
};

/* END COMMAND FUNCTIONS */

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

function command(command, ...args) {
    commandString = args.length == 0 ? command : command + " " + args.join(" ");

    rootCommand = commandString.split(" ")[0];

    if (rootCommand == "stop" || rootCommand == "exit") { // give response if stopping server
        prependToResponseList(`<li><b>${commandString}</b>:<br>Terminating the process...<li></li>`);
    }

    socket.emit("command", commandString);
}

function prependToLogList(message) {
    logList.insertAdjacentHTML('afterbegin', message);
}

function prependToResponseList(message) {
    responsesList.insertAdjacentHTML('afterbegin', message);
}