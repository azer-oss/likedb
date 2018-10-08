import { Push } from "indexeddb";
export default class PushForServers extends Push {
    constructor(servers: any, options: any);
    checkForUpdates(): void;
    sendUpdates(updates: any, callback: any): void;
    updatePushLog(until: any, callback: any): void;
    getPushLog(callback: any): void;
    onError(err: any): void;
}
