const axios = require('axios');
const { discovery } = require('./discovery');

// const discovery = new Discover();

// import axios from 'axios';
// import { discovery } from './discovery';

class Tablo {
  constructor() {
    // console.log('Tablo constructor');
    // It would be awesome to discover when init'd
    // if (device == null){
    //     console.log("No device given!")
    //     throw Error("No device given!")
    //
    // }
    this.devices = {};
    this.airings = null;
  }

  async discover() {
    // const discovery = new Discover();
    console.log('Tablo.discover', discovery);
    const x = await discovery.broadcast();
    console.log(x);
    let device = {};
    if (Object.keys(x).length > 0) {
      // console.debug("Broadcast discovery succeeded.");
      device = {
        ip: x.private_ip,
        server_id: x.server_id,
        via: 'broadcast',
      };
    } else {
      console.log('Broadcast discovery failed, trying HTTP fallback.');

      const y = await discovery.http();
      if (Object.keys(x).length > 0) {
        device = {
          ip: y.cpes[0].private_ip,
          server_id: y.cpes[0].serverid,
          via: 'http',
        };
      }
    }
    this.device = device;
    return device;
  }

  async getServerInfo() {
    try {
      const info = await this.get('/server/info');
      info.checked = new Date();
      return info;
    } catch (e) {
      console.log(e);
      return {};
    }
  }

  async getRecordings({ countOnly = false, force = false, callback = null }) {
    try {
      if (!this.airings || force) {
        this.airings = await this.get('/recordings/airings');
      }

      if (countOnly) return this.airings.length;

      return await this.batch(this.airings, callback);
    } catch (error) {
      console.error(error);
      return {};
    }
  }

  async delete(path) {
    const url = this.getUrl(path);
    return axios.delete(url);
  }

  async get(path) {
    if (typeof this.device === 'undefined') {
      console.log('TabloAPI - No device selected, returning null.');
      return null;
    }
    try {
      const url = this.getUrl(path);
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error(error);
      return {};
    }
  }

  getUrl(path) {
    const newPath = path.replace(/^\/+/, '');
    return `http://${this.device.ip}:8885/${newPath}`;
  }

  async batch(data, callback = null) {
    let chunk = [];
    let idx = 0;
    const size = 50;
    let recs = [];
    while (idx < data.length) {
      chunk = data.slice(idx, size + idx);
      idx += size;
      // eslint-disable-next-line no-await-in-loop
      const returned = await this.post({ path: 'batch', data: chunk });
      recs = recs.concat(Object.values(returned));
      if (typeof callback === 'function') {
        callback(recs.length);
      }
    }
    return recs;
  }

  async post({ path = 'batch', data = null }) {
    if (typeof this.device === 'undefined') {
      console.log('TabloAPI - No device selected, returning null.');
      return null;
    }

    try {
      const url = this.getUrl(path);
      const returned = await axios.post(url, data);
      return returned.data;
    } catch (error) {
      console.log(error);
      return {};
    }
  }
}

exports.default = Tablo;
exports.Tablo = Tablo;
