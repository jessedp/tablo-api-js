export default interface Device {
    board: string;
    private_ip: string;
    server_id: string;
    via: string;
    dev_type: string;
    host?: string;
    public_ip?: string;
    slip?: number;
    http?: number;
    ssl?: number;
    inserted?: string;
    modified?: string;
    lastSeen?: string;
    server_version?: string;
    name?: string;
    roku?: number;
}
