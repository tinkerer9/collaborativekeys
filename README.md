# CollaboKeys
A collaborative keyboard game

Made by @tinkerer9, @LethalShadowFlame, and @chickenlloyd for a hackathon with theme "Connection".
We got 2nd place out of 14 teams!

Players collaborate to play any keyboard-based game with their assigned key.
Think quick!

## Instructions

### Install dependencies

The host/server program is made to run on MacOS.
See `src/type.js` if you want to change the key emulation system to work for another platform.

- `nodejs`: download latest version from https://nodejs.org/en/download
- `socket.io`: run `npm install socket.io` in the terminal

### Run server

Set directory to project root. Run the following command:
```
node src/server.js
```

#### Example terminal output

```
Server running at localhost (port 80).
Player 0 connected.
Valid keypress from Max (player 0): keystroke "e" (e).
Valid keypress from Max (player 0): key code 49 ( ).
```

### Join server

Players should enter the server's IP address into their web browser (port 80). They must be on the same internet network.

Example URL: `MaxsMax.local` (port 80 is http default)

### Gameplay

Players should enter a username (between 3-20 alphanumeric charachters) into the username box.

Then, they can start pressing keys.
Any unreserved key will be assigned to them, and only they can press their assigned keys.

Keypresses will be sent to the server, which will parse them and emulate the same keypress in the current application.

#### Reccomended games

- Snake
- 2048

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

## Possible updates

This program was made very quickly for a hackathon, so we weren't able to add all the features we'd hoped.

Here are a few we might want to add later:
- **Each player can see their assigned keys** (starred)
- The host must allow each player to join
- The host can choose which key each player is assigned
- The host can easily start/stop emulation
- The host can easily reset assignments (currently players can reload their page to "give up" their assignments)
- Each player gets the same amount of keys assigned
- Better user interface for both players and the host
- Virtual keyboard support