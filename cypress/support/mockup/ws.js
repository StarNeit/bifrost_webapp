/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
const WebSocket = require('ws');
const fs = require('fs');

let data = fs.readFileSync('./data.json');
const wss = new WebSocket.Server({ port: 80 });
console.log('server started');
wss.on('connection', (ws) => {
  console.log('client connected');
  setTimeout(() => {
    console.log('sending data...');
    ws.send(`{ "measurement": ${data}, "success": true }`);
  }, 1000);

  ws.on('message', (msg) => {
    if (JSON.parse(msg).measurementSet) {
      console.log('data ', msg);
      data = msg;
    }
    console.log('Got message');
  });

  ws.on('close', () => {
    console.log('connection closing');
  });
});
