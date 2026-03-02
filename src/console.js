const readline = require('readline');

const COMMAND_ARG_SEP = " "

function spliceCommand(input) {
    return input.split(COMMAND_ARG_SEP);
}

function getCommand(arr) {
    return arr[0]
}

function getArguments(arr) {
    return arr.slice(1, arr.length)
}

function handleCommand(input) {

}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

