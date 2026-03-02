/* This script manages the keyboard emulation on the host's computer. */

const { exec } = require("child_process");

/* Parse select JavaScript key names into AppleScript key names and human readable names */
function parseKey(key) {
    switch (key) {
        case "Enter":
            return "key code 36";
            break;
        case " ":
            return "key code 49";
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
        default:
            if (key.length == 1) { // other "complex" keys aside ones above not allowed
                return "keystroke \"" + key + "\"";
            } else {
                return null;
            }
    }
}

function nameKey(key) { // names a key (human readable)
    switch (key) {
        case "Enter":
            return "return"; // assuming Mac
            break;
        case " ":
            return "space";
            break;
        case "ArrowLeft":
            return "left arrow";
            break;
        case "ArrowRight":
            return "right arrow";
            break;
        case "ArrowDown":
            return "down arrow";
            break;
        case "ArrowUp":
            return "up arrow";
            break;
        default:
            if (key.length == 1) { // other "complex" keys aside ones above not allowed
                return key;
            } else {
                return null;
            }
    }
}

function keypress(key) {
    keycode = parseKey(key);

    if (keycode == null) return false;

    exec(`osascript -e \'tell application "System Events" to ${keycode}\'`); // run shell script to emulate keypress

    return true;
}

module.exports = { nameKey, keypress };