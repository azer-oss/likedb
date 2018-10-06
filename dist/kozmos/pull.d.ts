import { Pull, types as idbTypes } from "indexeddb";
import PostQueue from "./post-queue";
import Servers from "./servers";
import * as types from "./types";
export default class PullForServers extends Pull {
    servers: Servers;
    postQueue: PostQueue;
    constructor(servers: Servers, options: types.IAPIOptions);
    receive(updates: idbTypes.IUpdate[], callback: idbTypes.ICallback): void;
}
