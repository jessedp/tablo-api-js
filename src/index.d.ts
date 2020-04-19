import Device from "./Device";
import ServerInfo from "./ServerInfo";
export default class Tablo {
    private devices;
    private airingsCache;
    private device;
    /**
     * Utilizes HTTP discovery with UDP broadcast fallback to find local Tablo devices
     */
    discover(): Promise<Device[]>;
    /**
     * Pre-flight check
     * @throws Error when no device has been selected
     */
    private isReady;
    /**
     * Returns server info reported by the Tablo
     */
    getServerInfo(): Promise<ServerInfo>;
    /**
     *  Returns a count of the Recordings on the Tablo
     * @param force whether or not to force reloading from the device or use cached airings
     */
    getRecordingsCount(force?: boolean): Promise<0>;
    /**
     * Retrieves all Recordings from the Tablo
     * @param force whether or not to force reloading from the device or use cached airings
     * @param progressCallback function to receive a count of records processed
     */
    getRecordings(force: boolean, progressCallback: (num: number) => void): Promise<unknown[]>;
    /**
     * Deletes a
     * @param path
     */
    delete(path: string): Promise<import("axios").AxiosResponse<any>>;
    /**
     * Try to receive data from a specified path
     * @param path
     */
    get<T>(path: string): Promise<T>;
    private getUrl;
    private batch;
    post<T>(path?: string, strArray?: string[]): Promise<T[]>;
}
export { Tablo };
