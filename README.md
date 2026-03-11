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

Set your working directory to project root `/`. Run the following command:
```
node src/server.js
```
Be sure to accept MacOS requests to control your keyboard, as it is needed to simulate input.

### Join server

Players should enter the server's IP address into their web browser (port 80, see `config.json` to change port).

They must be on the same Wi-Fi network, unless your router is configured to allow devices to host outbound internet connections (not reccomended).

### Gameplay

Players should enter a username (between 3-20 alphanumeric charachters) into the username box.

After that, said user can start pressing keys.
Any unreserved key will be assigned to them after the first press, and only they will be able to press their assigned keys.
They can see those keys on the right side of the screen.

Keypresses will be sent to the server, which will parse them and emulate the same keypress in the current application.

You can refresh the page to give up all your assigned key presses.

### Security concerns

As this program allows players on the same network to control the host's keyboard (limited to only their assigned keys, which could be all), it has some security concerns.

The host should always monitor what other people are typing and what is happening on their computer.

#### How to stop

If at any point someone malicious connects to your computer and starts pressing keys, press `Control+C` on the terminal as soon as possible.
If you cannot do this, press `Command+Option+Escape`, select the application running this program (ex. Code), and press `Force Quit`.

## Is my game supported?

In order for a game to be supported by CollaboKeys, the following must all be true:
- The game only uses keypresses for input (no mouse)
- All keys used in the game are supported (see `Supported keys` below)
- The game would work with input lag (no games that need a high response time)
- The game has a number of keys greater than or equal to the number of players

### Reccomended games

**2048** is a great game to play with multiple players.
Each player can get one or two keys, and they have to work together (or alone!) to play.

Keep in mind that there is quite a bit of lag between a player typing a key and it being emulated, due to AppleScript delqay times.

## Supported keys

The `type.js` script only allows the following keys to be emulated:
- a-z, A-Z, 0-9
- `!`, `@`, `#`, `$`, `%`, `^`, `&`, `*`, `(`, `)`
- `-`, `_`, `=`, `+`
- `[`, `{`, `]`, `}`, `\`, `|`
- `;`, `:`, `'`, `"`, ``` ` ```, `~`
- `,`, `<`, `.`, `>`, `/`, `?`
- `space`, `return`
- arrow keys
- `shift`, `caps lock`, `delete`, `tab`, `command`, `option`, `control`, `esc` (*disabled by default, `shift` and `caps lock` do not work*)
- F keys 1-20 (*disabled by default*)

All keys on a modern Mac laptop are supported, with the exeption of `fn` (as it is a low-level hardware modifier) and the power button.

See `keycodes.js` for more information on each key.

## Console controls

Here are the following commands that can be run from the terminal. A `/` or other character is not needed to signal a command.

- **`stop`/`exit`**: Terminates the process.
- **`waitingroom`/`wr <admit/dismiss> <id/all>`**: Admit or dismiss someone from the waiting room.
- **`list <active/wr/waitingroom/all/nameless>`**: Lists player ids/names that are either currently active, in the waiting room, or both.
- **`key`/`k <revoke/enable/disable> <key/all>`**: Modifies a specific/every key to revoke it from everyone, or enable/disable it.
- **`pause`**: Disables emulation.
- **`resume`**: Enables emulation.

### To-do

- Command to list key data (like `list`)
- Disable/enable key reservation

## Admin page

CollaboKeys supports an admin page that can be opened at any device, not just the host's computer.
They have to enter the admin password found at `config.js` (defualt is `hackathon2026`).

All controls supported by the console (see section above) can be used by the admin page, as well as a custom command box.
Those commands are the exact same as above.

## Configuration file

There is a configuration file at `src/config.json` with the following settings:

| Setting | Default | Description |
| :-: | :-: | :-: |
| `"adminPassword"` | `"hackathon2026"` | The password for admins to autheticate themselves (if set to `""` then no password needed) |
| `"serverPort"` | `80` | The port at which the server is listening (port `80` is HTTP default so no colon needed) |
| `"allowEmulationAtStart"` | `true` | Enable key emulation by default for all players |
| `"waitRoomPlayersWhenJoined"` | `false` | Add new players to the wait room when joined |

## Possible updates

This program was made very quickly for a hackathon, so we weren't able to add all the features we'd hoped.

Here are a few we might want to add later (and are working on!):
- Show players unassigned keys
- Each player gets the same amount of keys assigned
- Better user interface for both players and the host
- Virtual keyboard support for mobile/tablet
- Responsive grid
- Cleaner GUI
- Add windows key emulation (platform checker)
- FIX: When player screen dims, they leave & rejoin but still are logged in
- Use key strokes for 1-letter keys on `keycodes.js` instead of keycodes
- Add space after list element on admin page responses section
- `type.js` faster alternative (or make AppleScript faster)
- Allow keys to be held
- Allow shift key to work