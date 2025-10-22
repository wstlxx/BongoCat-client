const WebSocket = require('ws');
const iohook = require('@mechakeys/iohook');

const wss = new WebSocket.Server({ port: 8080 });

console.log('WebSocket server started on port 8080');
console.log('Starting global input listener...');

// Mapping from iohook keycodes to the format the client expects
const keycodeMap = {
  57: 'Space', 3640: 'Alt', 56: 'Alt', 29: 'Control', 3613: 'Control',
  42: 'Shift', 54: 'Shift', 3638: 'Shift', 3675: 'Meta', 3676: 'Meta',
  1: 'Escape', 59: 'F1', 60: 'F2', 61: 'F3', 62: 'F4', 63: 'F5',
  64: 'F6', 65: 'F7', 66: 'F8', 67: 'F9', 68: 'F10', 87: 'F11', 88: 'F12',
  15: 'Tab', 28: 'Return', 14: 'Backspace', 58: 'CapsLock',
  3657: 'Insert', 3667: 'Delete', 3655: 'Home', 3663: 'End',
  3656: 'PageUp', 3664: 'PageDown', 3653: 'UpArrow', 3661: 'DownArrow',
  3659: 'LeftArrow', 3660: 'RightArrow',
  16: 'KeyQ', 17: 'KeyW', 18: 'KeyE', 19: 'KeyR', 20: 'KeyT', 21: 'KeyY',
  22: 'KeyU', 23: 'KeyI', 24: 'KeyO', 25: 'KeyP', 30: 'KeyA', 31: 'KeyS',
  32: 'KeyD', 33: 'KeyF', 34: 'KeyG', 35: 'KeyH', 36: 'KeyJ', 37: 'KeyK',
  38: 'KeyL', 44: 'KeyZ', 45: 'KeyX', 46: 'KeyC', 47: 'KeyV', 48: 'KeyB',
  49: 'KeyN', 50: 'KeyM',
  2: 'Num1', 3: 'Num2', 4: 'Num3', 5: 'Num4', 6: 'Num5', 7: 'Num6',
  8: 'Num7', 9: 'Num8', 10: 'Num9', 11: 'Num0',
};


function broadcast(action) {
  const message = JSON.stringify(action);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

iohook.on('keydown', (event) => {
  const keyName = keycodeMap[event.keycode];
  if (keyName) {
    console.log(`Sending action: KeyboardPress, value: ${keyName}`);
    broadcast({ kind: 'KeyboardPress', value: keyName });
  } else {
    console.log(`Unknown keydown code: ${event.keycode}`);
  }
});

iohook.on('keyup', (event) => {
  const keyName = keycodeMap[event.keycode];
  if (keyName) {
    console.log(`Sending action: KeyboardRelease, value: ${keyName}`);
    broadcast({ kind: 'KeyboardRelease', value: keyName });
  } else {
    console.log(`Unknown keyup code: ${event.keycode}`);
  }
});

iohook.on('mousedown', (event) => {
    const buttonName = `Mouse${event.button}`;
    console.log(`Sending action: MousePress, value: ${buttonName}`);
    broadcast({ kind: 'MousePress', value: buttonName });
});

iohook.on('mouseup', (event) => {
    const buttonName = `Mouse${event.button}`;
    console.log(`Sending action: MouseRelease, value: ${buttonName}`);
    broadcast({ kind: 'MouseRelease', value: buttonName });
});

iohook.on('mousemove', (event) => {
    // Note: Mouse move events can be very frequent.
    // Consider whether you want to rate-limit these.
    broadcast({ kind: 'MouseMove', value: { x: event.x, y: event.y } });
});

// Start listening
iohook.start();

console.log('IOHook is listening for global input events.');

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', () => {
    console.log('Client disconnected');
  });
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  iohook.stop();
  wss.close(() => {
    console.log('WebSocket server closed.');
    process.exit(0);
  });
});
