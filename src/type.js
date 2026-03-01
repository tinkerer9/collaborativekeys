/* This script manages the keyboard emulation on the host's computer. */

const exec = require("child_process");

/* Parse select JavaScript key names into AppleScript key names */
function parseKey(key) {
    switch (key) {
        case "Enter":
            return "key code 36";
            break;
        case "ArrowLeft":
            return "key code 123";
            break;
        case "ArrowRight":
            return "key code 124";
            break;
        case "ArrowDown":
            return "key code 125";
            break;
        case "ArrowUp":
            return "key code 126";
            break;
        case " ":
            return "key code 49";
            break;
        case "Tab":
            return "key code 48";
            break;
        case "Backspace":
            return "key code 51";
            break;
        default:
            if (key.length == 1) { // other "complex" keys aside ones above not allowed
                return "keystroke \"" + key + "\"";
            } else {
                return;
            }
    }
}

function keypress(key) {
    keycode = parseKey(key);

    if (keycode != undefined) {
        exec(`osascript -e \'tell application "System Events" to ${keycode}\'`); // run shell script to emulate keypress
    }

    return keycode;
}

module.exports = { keypress };