# API to connect to the X-Rite Bridge App

The API uses websockets and JSON.

  The connection is always opened by the Web application and normally also closed
  by the Web application. If an error occurred, the Bridge App sends an error
  message and closes the connection by itself.

  To request a measurement from the Bridge App, the following message has
  to be sent (example):

```javascript
  {
    "command": "requestMeasurement",
    "parameters": {
      "applicationName": "X-Rite Solos",
      "conditions": {
        "dataMode": "ma9x",
        "numberOfAveragingSamples": 3
      }
    }
  }
```

  This brings up the UI of the Bridge App. The user is expected to perform
  a measurement and send the results back to the web application.

  The data mode and the number of averaging samples can be omitted. In this
  case the Bridge App user can choose these values.

  The response from the Bridge App has the following format (example):

```javascript
  {
    "success": true,
    "measurement": {
      "device": {
        "type": "MA-3/5",
        "serialNumber": "2900000",
        ...
      },
      "measurementSet": {
        "name": "20201201_154858",
        "id": "20201201_154858",
        "measurements": [
          {
            "colorValues": ...
          },
          ...
        ]
      }
    }
  }

  or

  {
    "success": false,
    "errorCode": "applicationBusy",
    "errorMessage": "Bridge App is busy"
  }
```

  The returned measurement data has the same format that is used to upload
  measurements to the cloud, but not splitted up into several parts.

  After the measurement data has been received, the Web application can
  terminate the request by closing the connection or waiting for further
  measurements.

## Fake Bridge App Connection

In a new directory, add the file below (ws.js).

  ```javascript
  const WebSocket = require('ws');
  const fs = require('fs');
  const data = fs.readFileSync('./data.json');
  console.log('data loaded');
  const wss = new WebSocket.Server({ port: 80 });
  console.log('server started');
  wss.on('connection', function connection(ws) {
      console.log('client connected');
      setTimeout(() => {
          console.log('sending data...');
          ws.send(`{ "measurement": ${data}, "success": true }`);
      }, 1000);
      ws.on('close', function closing() {
          console.log('connection closing');
      });
  });
```

Then run below in the new directory.

```console
  npm i ws
```

create data.json using the test data at the link below.

<https://github.com/X-Rite/device-measurements-service/blob/develop/test/data/ma91.json>

Then run to start the websocket.

```console
  node ws.js
```
