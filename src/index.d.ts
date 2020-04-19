// import { Tablo } from "./index"
import Device from "./Device";
import ServerInfo from "./ServerInfo";

/**
 Simple API for accessing Tablo devices
 */
export class Tablo {
    constructor(...args: any[]);

    batch(...args: any[]): void;

    delete(...args: any[]): void;

    discover(...args: any[]): Device;

    get(...args: any[]): void;

    getRecordings(...args: any[]): void;

    getRecordingsCount(...args: any[]): void;

    getServerInfo(...args: any[]): ServerInfo;

    getUrl(...args: any[]): void;

    isReady(...args: any[]): void;

    post(...args: any[]): void;

}

