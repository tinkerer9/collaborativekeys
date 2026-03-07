/* This script manages the keyboard emulation on the host's computer. */

const { exec } = require("child_process");

const Config = require("./config.json");
const Keycodes = require("./keycodes"); // a list of keynames, their keycodes, human-readable names, and enabled/disabled

let allowEmulation = Config.allowEmulationAtStart; // only referenced in server.js, changed in console.js

function keyExists(key) {
    return key in Keycodes;
}
function keyEnabled(key) {
    return Keycodes[key][3];
}
function enableKey(key) {
    Keycodes[key][3] = true;
}
function disableKey(key) {
    Keycodes[key][3] = false;
}
function enableAllKeys() {
    Object.keys(Keycodes).forEach(key => {
        enableKey(key);
    });
}
function disableAllKeys() {
    Object.keys(Keycodes).forEach(key => {
        disableKey(key);
    });
}
function keyName(key) {
    return Keycodes[key][1];
}
function keypress(key) {
    let [keycode,, needsShift] = Keycodes[key]; // get key info

    exec(`osascript -e \'tell application "System Events" to key code ${keycode}${needsShift ? " using shift down" : ""}\'`); // run shell script to emulate keypress (SLOW)
}

module.exports = { keyExists, keyEnabled, enableKey, disableKey, enableAllKeys, disableAllKeys, keyName, keypress, allowEmulation };