import axios from 'axios';
import * as Debug from 'debug';

import { discovery } from './discovery';
import IDevice from "./IDevice";

const debug = Debug('index');


class Tablo {
  private devices: IDevice[];
  private airings: [];
  private device: IDevice;

  // constructor() { }

  /** This should really look for and return multiple devices if they exist, but I can't test that :/
   *  ditto for the Discover methods this calls
   */
  public async discover() {
    // const discovery = new Discover();
    let discoverData = await discovery.broadcast();
    debug('discover.broadcast:');
    debug(discoverData);

    let via = null;
    if (Object.keys(discoverData).length > 0) {
      debug("Broadcast discovery succeeded.");
      via = 'broadcast';
    } else {
      debug('Broadcast discovery failed, trying HTTP fallback.');

      discoverData = await discovery.http();
      if (discoverData && Object.keys(discoverData).length > 0) {
        via = 'http';
      }
    }
    if (!via){
      return [];
    }
    discoverData.forEach(function (part, index) {
      this[index].via = via;
    }, discoverData); // use arr as this

    this.devices = discoverData;
    this.device = discoverData[0];
    return discoverData;
  }

  public async getServerInfo() {
    try {
      const info = await this.get('/server/info');
      info.checked = new Date();
      return info;
    } catch (e) {
      console.error(e);
      return {};
    }
  }

  public async getRecordings({ countOnly = false, force = false, callback = null }) {
    try {
      if (!this.airings || force) {
        this.airings = await this.get('/recordings/airings');
      }

      if (countOnly) { return this.airings.length; }

      return await this.batch(this.airings, callback);
    } catch (error) {
      console.error('getRecordings:', error);
      return {};
    }
  }

  public async delete(path) {
    const url = this.getUrl(path);
    return axios.delete(url);
  }

  public async get(path) {
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

  public getUrl(path) {
    const newPath = path.replace(/^\/+/, '');
    return `http://${this.device.ip}:8885/${newPath}`;
  }

  public async batch(data, callback = null) {
    let chunk = [];
    let idx = 0;
    const size = 50;
    let recs = [];
    while (idx < data.length) {
      chunk = data.slice(idx, size + idx);
      idx += size;
      // eslint-disable-next-line no-await-in-loop
      const returned = await this.post({ path: 'batch', data: chunk });
      // FIX: maybe? no idea if this works instead of Object.values()
      const values = Object.keys(returned).map( (el) =>{
        return returned[el]
      });

      recs = recs.concat(values);
      if (typeof callback === 'function') {
        callback(recs.length);
      }
    }
    return recs;
  }

  public async post({ path = 'batch', data = null }) {
    if (typeof this.device === 'undefined') {
      console.error('TabloAPI - No device selected, returning null.');
      return null;
    }

    try {
      const url = this.getUrl(path);
      const returned = await axios.post(url, data);
      return returned.data;
    } catch (error) {
      console.error(error);
      return {};
    }
  }
}

exports.default = Tablo;
exports.Tablo = Tablo;
