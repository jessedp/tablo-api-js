import Timeout = NodeJS.Timeout;
import axios from 'axios';
import bytes = require('byte-data');
import * as Debug from 'debug'
import dgram = require('dgram');


const debug  = Debug('discovery');

import Device from "./Device";

export default class Discover {
  private readonly sendPort: number = 8881;
  private readonly recvPort: number = 8882;
  private readonly discoveryUrl: string = 'https://api.tablotv.com/assocserver/getipinfo/';
  private watcher: Timeout;

  /**
   * Attempt discovery via UDP broadcast. Will only return a single device.
   */
  public async broadcast(): Promise<[Device]> {
    const server = dgram.createSocket('udp4');

    server.on('error', (error) => {
      debug('Bcast Error: ', error);
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
          debug('Bcast Error: %s', error);
        } else {
          debug('Bcast request sent');
        }
        client.close();
      });
    });

    let outerDevice:Device;

    server.on('message', (msg, info) => {
      if (msg.length !== 140) {
        debug(`UNK: Received ${msg.length} of 140 required bytes from ${info.address}:${info.port}`);
        debug(msg);
        server.close();
        return false;
      }
      // this is the proper format string let s = struct('>4s64s32s20s10s10s')
      // s = struct.format('b').unpack()

      const trunc = (txt: string) => txt.split('\0', 1)[0];
      const device:Device = {
        host: trunc(bytes.unpackString(msg, 4, 68)),
        private_ip: trunc(bytes.unpackString(msg, 68, 100)),
        // resp_code: trunc(bytes.unpackString(msg, 0, 4)),
        server_id: trunc(bytes.unpackString(msg, 100, 120)),
        dev_type: trunc(bytes.unpackString(msg, 120, 130)),
        board: trunc(bytes.unpackString(msg, 130, 140)),
        via: 'broadcast'
      };
      clearTimeout(this.watcher);
      server.close();
      debug('server.on.message received:');
      debug(device);
      // I feel like this shouldn't work, but...
      outerDevice = device;
      // eslint wanted a return, this works but may be wrong
      return device;
    });

    server.bind(this.recvPort);

    this.watcher = setTimeout(() => {
      server.close();
    }, 250); // should be 250

    // this is easily grosser and more wronger than it looks
    return new Promise((resolve) => {
      server.on('close', () => {
        debug('broadcast : close');
        debug('broadcast, data:');
        debug(outerDevice);
        resolve([outerDevice]);
      });
    });
  }

  /**
   * Attempt discovery via HTTP broadcast using Tablo discovery service
   */
  public async http(): Promise<Device[]>{
    return new Promise(async (resolve, reject) => {

      let data: Device[];
      try {
        type Response = { data: { cpes: Device[]}};
        const response:Response = await axios.get(this.discoveryUrl);
        data = response.data.cpes;
        data.forEach((part, index, arr) => {
          if (arr[index]) {
            arr[index].via = 'http';
          }
        }, data); // use arr as this
      } catch (error) {
        debug('Http Error:', error);
        reject( new Error(`Http Error: ${error}`) );
      }
      resolve(data);
    });
  }
}

export const discovery = new Discover();