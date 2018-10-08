"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const indexeddb_1 = require("indexeddb");
const sanitize_1 = require("../sanitize");
// Receives updates from other sources
class CustomIndexedDBPull extends indexeddb_1.IndexedDBPull {
    copyUpdate(update, callback) {
        const store = this.stores()[update.store];
        if (!store)
            return callback(new Error("Unknown store: " + update.store));
        if (update.action !== "delete") {
            update.doc = sanitize_1.default(update.doc);
        }
        if (update.action !== "add") {
            return super.copyUpdate(update, callback);
        }
        store.get(update.documentId, (err, result) => {
            if (!err && result) {
                update.action = "update";
            }
            return super.copyUpdate(update, callback);
        });
    }
}
exports.default = CustomIndexedDBPull;
