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
const sanitize_1 = require("../sanitize");
// Receives updates from other sources
class CustomIndexedDBPull extends indexeddb_1.IndexedDBPull {
    copyUpdate(update, callback) {
        const _super = Object.create(null, {
            copyUpdate: { get: () => super.copyUpdate }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const store = this.stores()[update.store];
            if (!store)
                return callback(new Error("Unknown store: " + update.store));
            if (update.store !== "bookmarks") {
                return _super.copyUpdate.call(this, update, callback);
            }
            if (update.action !== "delete") {
                update.doc = sanitize_1.default(update.doc);
            }
            if (update.action !== "add") {
                return _super.copyUpdate.call(this, update, callback);
            }
            store.get(update.documentId, (err, result) => {
                if (!err && result) {
                    update.action = "update";
                }
                return _super.copyUpdate.call(this, update, callback);
            });
        });
    }
}
exports.default = CustomIndexedDBPull;
