export default interface ServerInfo {
    server_id: string;
    name: string;
    timezone: string;
    version: string;
    local_address: string;
    setup_completed: boolean;
    build_number: number;
    model: Model;
    availability: string;
    cache_key: string;
    checked: string;
}
export interface Model {
    wifi: boolean;
    tuners: number;
    type: string;
    name: string;
    device: string;
}
