# tablo-api-js
**tablo-api-js** provides a simple API module to interact with Tablo DVRs. 
It was developed to be used with Node.js/electron - it may work in the browser, 
though ymmv.

## Installation
Install with npm
```bash
  npm install tablo-api
```
or with yarn
```bash
  yarn add tablo-api
```                 

## Usage
In Node:

```js
const Tablo = require('tablo-api');

const Api = new Tablo();

const devices = Api.discover();

Api.device = { ip: "192.168.1.100" }

const serverInfo = Api.getServerInfo();

```

## Development
After you've cloned this repo, there are some built-in commands to aid in development:

**Build the package** -  outputs built files to `./dist/`. These are the ones that will ultimately end up in the pacakage.
```bash
npm run-script build
```
or
```bash
yarn build
```
**Linter** - runs standard lint checks to keep code clean.
```bash
npm run-script lint
```
or
```bash
yarn lint
```
**Formatter** - formats the code **in place** for consistency.
```bash
npm run-script format
```
or
```bash
yarn format
```

## Licence

MIT

