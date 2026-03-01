# CollaboKeys
A collaborative keyboard game

Made by [@tinkerer9](https://github.com/tinkerer9), [@LethalShadowFlame](https://github.com/LethalShadowFlame), and [@chickenlloyd](https://github.com/chickenlloyd) for a hackathon with theme "Connection".
We got 2nd place out of 14 teams!

Players collaborate to play any keyboard-based game with their assigned key, making browsing the internet a simple puzzle.
Think quick!

## Instructions

### Install dependencies

The host/server program is made to run on MacOS, but the client webpage should run on almost any computer.
See `src/type.js` if you want to change the key emulation system to work for another platform.
It currently uses AppleScript to emulate key strokes using a built-in MacOS library called `osascript`.

- `nodejs`: download latest version from https://nodejs.org/en/download
- `socket.io`: run `npm install socket.io` in the terminal

### Run server

Set your working directory to project root. Run the following command:
```
node src/server.js
```
Be sure to accept the requests to control your keyboard, as it is needed to simulate input.

#### Example terminal output

```
Server running at localhost (port 80).
Player 0 connected.
Valid keypress from Max (player 0): keystroke "e" (e).
Valid keypress from Max (player 0): key code 49 ( ).
```

### Join server

Players should enter the server's IP address into their web browser (port 80).
They must be on the same Wi-Fi network, unless your router is configured to allow devices to host outbound internet connections.
**Hosting over the internet is not recommended for security purposes.**

#### Example URLs

- IP address: `192.168.1.197` (port 80 is HTTP default)
- Hostname: `mycomputer.local`
- Cross-internet: `1.2.3.4`

### Gameplay

Players should enter a username (between 3-20 alphanumeric charachters) into the username box.

After that, said user can start pressing keys.
Any unreserved key will be assigned to them after the first press, and only they can press their assigned keys.
They can see those keys on the right side of the screen.

Keypresses will be sent to the server, which will parse them and emulate the same keypress in the current application.

You can refresh the page to give up all your assigned key presses.

#### Reccomended games

**2048** is a great game to play with multiple players.
Each player can get one or two keys, and they have to work together (or alone!) to play.

Keep in mind that there is quite a bit of lag between a player typing a key and it being emulated.

There was also a test game made for this project at `localhost/demo/index.html`.

## Security concerns

As this program allows players on the same network to control the host's keyboard (limited to only their assigned keys, which could be all), it has some security concerns.

The `type.js` script only allows the following keys to be emulated:
- a-z, A-Z, 0-9
- any one-charachter symbol (ex. `$`, `.`, `★`) or emojis
- `space`, `tab`, `shift`, `delete`, `return`
- arrow keys

More powerful keys like the `command` or `esc` keys are send from the client, but not emulated by the server.

The host should always monitor what other people are typing and what is happening on their computer.

### How to stop

If at any point someone malicious connects to your computer and starts pressing keys,press `Control+C` on the terminal as soon as possible.
If you cannot do this, press `Command+Option+Escape`, select the application running this program, and press `Force Quit`.

## Possible updates

This program was made very quickly for a hackathon, so we weren't able to add all the features we'd hoped.

Here are a few we might want to add later:
- The host must allow each player to join
- The host can choose which key each player is assigned
- The host can easily start/stop emulation
- The host can easily reset assignments
- The host can choose which keys are pressable
- Each player gets the same amount of keys assigned
- Better user interface for both players and the host
- Virtual keyboard support
- Cleaner GUI