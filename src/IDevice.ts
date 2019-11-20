export default interface IDevice {
    ip: string;
    board: string;
    private_ip: string;
    server_id: string;
    via: string;

    // these are only from http discovery
    dev_type: string;
    host?: string;
    public_ip?: string;
    slip?: number;  // a port?
    http?: number;  // a port
    ssl?: number;   // a port or bool
    inserted?: string; // this is a date
    modified?: string; // this is a date
    lastSeen?: string; // this is a date
    server_version?: string;
    name?: string;
    roku?: number; // probably a bool

}