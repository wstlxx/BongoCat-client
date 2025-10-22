const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

console.log('WebSocket server started on port 8080');

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    try {
      // Convert the Buffer to a string before parsing
      const messageString = message.toString();
      const data = JSON.parse(messageString);

      // Log the parsed action
      console.log(`Received action: ${data.kind}, value: ${JSON.stringify(data.value)}`);

      // Broadcast the message to all other clients
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(messageString);
        }
      });
    }
    catch (e) {
      console.error('Failed to parse incoming message:', e);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});
