import { Push, types as idbTypes } from "indexeddb";
import Scheduler from "./scheduler";
import Servers from "./servers";
import * as types from "./types";
export default class PushForServers extends Push {
    servers: Servers;
    scheduler: Scheduler;
    store: idbTypes.IStore;
    constructor(servers: Servers, options: types.IAPIOptions);
    checkForUpdates(): Promise<void>;
    checkForStoreUpdates(store: string): Promise<boolean>;
    sendUpdates(store: string, updates: types.IAPIUpdates, callback: idbTypes.ICallback): void;
    updatePushLog(store: string, until: number, callback: idbTypes.ICallback): void;
    getPushLog(store: string, callback: idbTypes.ICallback): void;
    onError(err: Error): void;
}
