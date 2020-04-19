import Device from "./Device";
export default class Discover {
    private readonly sendPort;
    private readonly recvPort;
    private readonly discoveryUrl;
    private watcher;
    /**
     * Attempt discovery via UDP broadcast. Will only return a single device.
     */
    broadcast(): Promise<[Device]>;
    /**
     * Attempt discovery via HTTP broadcast using Tablo discovery service
     */
    http(): Promise<Device[]>;
}
export declare const discovery: Discover;
