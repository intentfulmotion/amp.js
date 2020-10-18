# amp.js

Interaction library for Amp smart lighting controller. Uses RxJS observables to communicate changes from the Amp.

## Usage

```js
const Amp = require('amp-smart-light')
let amp = new Amp()
```

### Connect to an Amp

```js
amp.connection.subscribe(connection => {
  switch (connection) {
    case ConnectionState.DISCONNECTED:
      break;
    case ConnectionState.CONNECTING:
      break;
    case ConnectionState.DISCOVERING_SERVICES:
      break;
    case ConnectionState.READY:
      alert('connected to amp')
      break;
  }
})

// the following line will only work from a user gesture
// see: https://developers.google.com/web/updates/2015/07/interact-with-ble-devices-on-the-web
const device = navigator.bluetooth.requestDevice(amp.getDeviceOptions())
await amp.connect(device)
```

[TODO]: add library documentation