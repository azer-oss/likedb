"use strict";
const Push = require("indexeddb/lib/push");
const Scheduler = require("./scheduler");
const syncdb = require("./sync-db");
// This class is for fetching new updates from Kozmos servers,
// and publishing them to user's offline database.
class PushForServers extends Push {
    constructor(servers, options) {
        super();
        this.servers = servers;
        this.scheduler = new Scheduler({
            interval: options.pushIntervalSecs || 15,
            fn: () => this.checkForUpdates()
        });
        this.store = syncdb.store("pushlogs", {
            key: { autoIncrement: true, keyPath: "id" },
            indexes: ["id"]
        });
        this.scheduler.schedule();
    }
    checkForUpdates() {
        this.getPushLog((err, log) => {
            if (err) {
                this.scheduler.schedule();
                return this.onError(err);
            }
            this.servers.get("/api/updates/" + (log ? log.until : 0), (err, updates) => {
                if (err) {
                    this.scheduler.schedule();
                    return this.onError(err);
                }
                if (!updates || !updates.content || updates.content.length === 0)
                    return this.scheduler.schedule();
                this.sendUpdates(updates, err => {
                    if (err)
                        return this.onError(err);
                    setTimeout(() => this.scheduler.schedule(updates.has_more ? 1 : undefined), 0);
                });
            });
        });
    }
    sendUpdates(updates, callback) {
        this.publish(updates.content, err => {
            if (err)
                return callback(err);
            if (this.servers.onReceiveUpdates) {
                setTimeout(() => this.servers.onReceiveUpdates(updates), 0);
            }
            this.updatePushLog(updates.until, callback);
        });
    }
    updatePushLog(until, callback) {
        this.getPushLog((err, log) => {
            if (!err && log) {
                log.until = until;
                return this.store.update(log, callback);
            }
            this.store.add({ until: until }, callback);
        });
    }
    getPushLog(callback) {
        this.store.all((err, result) => {
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
module.exports = PushForServers;
