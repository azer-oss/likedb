"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const indexeddb_1 = require("indexeddb");
const scheduler_1 = require("./scheduler");
const sync_db_1 = require("./sync-db");
// This class is for fetching new updates from Kozmos servers,
// and publishing them to user's offline database.
class PushForServers extends indexeddb_1.Push {
    constructor(servers, options) {
        super();
        this.servers = servers;
        this.scheduler = new scheduler_1.default({
            interval: options.pushIntervalSecs || 15,
            fn: () => this.checkForUpdates()
        });
        this.store = sync_db_1.default.store("pushlogs", {
            key: { autoIncrement: true, keyPath: "id" },
            indexes: ["id", "store"]
        });
        this.scheduler.schedule();
    }
    checkForUpdates() {
        return __awaiter(this, void 0, void 0, function* () {
            const stores = [
                "bookmarks",
                "collections",
                "collection-links",
                "speed-dial"
            ];
            let i = stores.length;
            let hasMore = false;
            while (i--) {
                hasMore = yield this.checkForStoreUpdates(stores[i]);
                if (hasMore) {
                    break;
                }
            }
            console.log("has more?", stores[i], hasMore);
            this.scheduler.schedule(hasMore ? 1 : undefined);
        });
    }
    checkForStoreUpdates(store) {
        return new Promise((resolve, reject) => {
            this.getPushLog(store, (err, log) => {
                if (err) {
                    return reject(err);
                }
                const endpoint = "/api/updates/" + store + "/" + (log ? log.until : 0);
                this.servers.get(endpoint, (err, updates) => {
                    if (err) {
                        return reject(err);
                    }
                    if (!updates || !updates.content || updates.content.length === 0)
                        return resolve(false);
                    console.log("send updates", updates);
                    this.sendUpdates(store, updates, err => {
                        if (err)
                            return this.onError(err);
                        setTimeout(() => resolve(updates.has_more), 0);
                    });
                });
            });
        });
    }
    sendUpdates(store, updates, callback) {
        this.publish(updates.content, (errors) => {
            if (errors)
                return callback(errors[0]);
            if (this.servers.onReceiveUpdates) {
                setTimeout(() => {
                    if (this.servers.onReceiveUpdates) {
                        this.servers.onReceiveUpdates(updates.content);
                    }
                }, 0);
            }
            this.updatePushLog(store, updates.until, callback);
        });
    }
    updatePushLog(store, until, callback) {
        console.log("update push log", store, until);
        this.getPushLog(store, (err, log) => {
            if (!err && log) {
                log.until = until;
                return this.store.update(log, callback);
            }
            this.store.add({ store, until }, callback);
        });
    }
    getPushLog(store, callback) {
        this.store.select("store", { only: store }, (err, result) => {
            if (err)
                return callback(err);
            if (!result)
                return callback();
            callback(undefined, result.value);
        });
    }
    onError(err) {
        this.servers.onError(err, "checking-updates");
    }
}
exports.default = PushForServers;
