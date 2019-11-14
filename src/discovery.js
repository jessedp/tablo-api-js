// const dgram = require('dgram');
import dgram from 'dgram';
import axios from 'axios';
// import bytes from 'byte-data';
// const axios = require('axios');
const bytes = require('byte-data');

export default class Discover {
  constructor() {
    this.sendPort = 8881;
    this.recvPort = 8882;
    this.discoveryUrl = 'https://api.tablotv.com/assocserver/getipinfo/';
    this.watcher = () => {};
  }

  broadcast() {
    const server = dgram.createSocket('udp4');
    console.log('in broadcast');
    server.on('error', (error) => {
      console.log(error);
      clearTimeout(this.watcher);
      server.close();
    });

    server.on('listening', () => {
      // once the server is listening, broadcast the discovery packet...
      const client = dgram.createSocket('udp4');
      client.bind(this.sendPort, () => {
        client.setBroadcast(true);
      });

      const data = Buffer.from('BnGr');
      const to = '255.255.255.255';
      client.send(data, this.sendPort, to, (error) => {
        if (error) {
          console.log('Error: %s', error);
        } else {
          // console.log('Data sent !!!')
        }
        client.close();
      });
    });

    server.on('message', (msg, info) => {
      if (msg.length !== 140) {
        console.log(msg);
        console.log(`UNK: Received ${msg.length} of 140 required bytes from ${info.address}:${info.port}`);
        server.close();
        return false;
      }
      // this is the proper format string let s = struct('>4s64s32s20s10s10s')
      // s = struct.format('b').unpack()

      const trunc = (txt) => txt.split('\0', 1)[0];
      const device = {
        resp_code: trunc(bytes.unpackString(msg, 0, 4)),
        host: trunc(bytes.unpackString(msg, 4, 68)),
        private_ip: trunc(bytes.unpackString(msg, 68, 100)),
        server_id: trunc(bytes.unpackString(msg, 100, 120)),
        dev_type: trunc(bytes.unpackString(msg, 120, 130)),
        board_type: trunc(bytes.unpackString(msg, 130, 140)),
      };
      clearTimeout(this.watcher);
      server.close();
      // eslint wanted a return, this works but may be wrong
      return device;
    });

    server.bind(this.recvPort);
    this.watcher = setTimeout(() => {
      server.close();
    }, 250);

    // this is easily grosser and more wronger than this or it looks
    return new Promise((resolve) => {
      server.on('close', () => {
        resolve();
      });
    });
  }

  async http() {
    try {
      const response = await axios.get(this.discoveryUrl);
      return response.data;
    } catch (error) {
      console.error(error);
      return {};
    }
  }
}

export const discovery = new Discover();

// export {Discover, discovery}

// export default Discover;
// export discover;
