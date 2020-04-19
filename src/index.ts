import axios from 'axios';
import * as Debug from 'debug';

import { discovery } from './discovery';
import Device from "./Device";
import ServerInfo from "./ServerInfo";

const debug = Debug('index');

const Axios = axios.create();

export default class Tablo {
  private devices: Device[];
  private airingsCache: [];
  private device: Device;
  
  /**
   * Utilizes HTTP discovery with UDP broadcast fallback to find local Tablo devices
   */
  async discover() {

    let discoverData: Device[];
    discoverData = await discovery.http();

    debug('discover.http:');
    debug(discoverData);

    if (Object.keys(discoverData).length === 0) {
      discoverData = await discovery.broadcast();
      debug('discover.broadcast:');
      debug(discoverData);
    }
    
    if (Object.keys(discoverData).length === 0) {
      return [];
    }

    // TODO: a nicety when testing, should probably remove
    this.devices = discoverData;
    this.device = this.devices[0];
    
    return discoverData;
  }

  /**
   * Pre-flight check
   * @throws Error when no device has been selected
   */
  private isReady() {
    if (typeof this.device === 'undefined' || !this.device || !this.device.private_ip) {
      const msg = 'TabloAPI - No device selected.'
      throw new Error(msg);
    }
  }

  /**
   * Returns server info reported by the Tablo
   */
  async getServerInfo() {
    this.isReady();

    try {
      const info: ServerInfo = await this.get('/server/info');
      return info;
    } catch (err) {
      throw err;
    }
  }

  /**
   *  Returns a count of the Recordings on the Tablo
   * @param force whether or not to force reloading from the device or use cached airings
   */
  async getRecordingsCount(force = false) {
    this.isReady();
    try {
      if (!this.airingsCache || force) {
        this.airingsCache = await this.get('/recordings/airings');
      }
      if (!this.airingsCache) {
        return 0;
      }
      return this.airingsCache.length;

    } catch (err) {
      throw err;
    }
  }

  /**
   * Retrieves all Recordings from the Tablo
   * @param force whether or not to force reloading from the device or use cached airings
   * @param progressCallback function to receive a count of records processed
   */
  async getRecordings(force = false, progressCallback: (num: number) => void ) {
    this.isReady();
    try {
      if (!this.airingsCache || force) {
        this.airingsCache = await this.get('/recordings/airings');
      }
      if (!this.airingsCache){
        return null;
      }
      
      return this.batch(this.airingsCache, progressCallback);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Deletes a
   * @param path
   */
  async delete(path: string) {
    this.isReady();
    const url = this.getUrl(path);
    return Axios.delete(url);
  }

  /**
   * Try to receive data from a specified path
   * @param path
   */
  async get<T>(path: string): Promise<T> {
    this.isReady();
    return new Promise( async (resolve, reject) => {
      try {
        const url = this.getUrl(path);
        const response: {data: T } = await Axios.get(url);
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });
  }

  private getUrl(path: string) {
    const newPath = path.replace(/^\/+/, '');
    return `http://${this.device.private_ip}:8885/${newPath}`;
  }

  private async batch<T>(data:string[], progressCallback: (arg0: number) => void):Promise<T[]> {
    this.isReady();

    return new Promise( async (resolve, reject) => {
      let chunk = [];
      let idx = 0;
      const size = 50;
      let recs: T[] = [];
      while (idx < data.length) {
        chunk = data.slice(idx, size + idx);
        idx += size;
        
        let returned: T[];
        try {
          returned = await this.post( 'batch', chunk );
        } catch (err) {
          reject(err);
        }

        const values = Object.keys(returned).map( (el) =>{
          return returned[el]
        });

        recs = recs.concat(values);
      
        if (typeof progressCallback === 'function') {
          progressCallback(recs.length);
        }
      }
      resolve(recs);
    });

  }

  async post<T>(path = 'batch', strArray?:string[] ):Promise<T[]> {
    this.isReady();
    const toPost = strArray ? strArray : null;
    return new Promise( async (resolve, reject) => {
      try {
        const url = this.getUrl(path);
        const returned:{ data: T[]} = await Axios.post(url, toPost);
        const { data } = returned;
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  }
}

export { Tablo };