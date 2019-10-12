"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const indexeddb_1 = require("indexeddb");
const post_queue_1 = require("./post-queue");
// Pull updates from source (offline DB), post it to Kozmos server
class PullForServers extends indexeddb_1.Pull {
    constructor(servers, options) {
        super();
        this.servers = servers;
        this.postQueue = new post_queue_1.default(this.servers, options);
    }
    // This function gets called whenever there is any updates.
    receive(updates, callback) {
        if (!Array.isArray(updates)) {
            updates = [updates];
        }
        this.postQueue.add(updates, callback);
    }
}
exports.default = PullForServers;
