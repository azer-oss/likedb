import Scheduler from "./scheduler";
import Servers from "./servers";
import * as types from "./types";
import { types as idbTypes } from "indexeddb";
export default class PostQueue {
    scheduler: Scheduler;
    servers: Servers;
    store: idbTypes.IStore;
    retryInterval: number;
    constructor(servers: Servers, options: types.IAPIOptions);
    add(updates: idbTypes.IUpdate[], callback: types.ICallback): void;
    all(callback: types.ICallback): void;
    post(): void;
    onError(err: any): void;
    onHTTPError(err: any): void;
}
