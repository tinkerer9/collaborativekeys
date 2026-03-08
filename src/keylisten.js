/* OS-level child process input detection */

const { Uiohook } = require('uiohook-napi'); // exposes inputs globally

const hook = new Uiohook();

hook.on('keydown', e => {
  process.send({
    type: 'keydown',
    keycode: e.keycode
  });
});

hook.on('keyup', e => {
  process.send({
    type: 'keyup',
    keycode: e.keycode
  });
});

hook.start();