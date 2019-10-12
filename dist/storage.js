"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const indexeddb_1 = require("indexeddb");
let dbref = null;
exports.db = (options) => {
    if (dbref !== null) {
        return dbref;
    }
    const dbname = options && options.testing ? "likedb-test-" + Date.now() : "likedb";
    dbref = indexeddb_1.default(dbname, {
        version: (options && options.version) || 1
    });
    return dbref;
};
exports.bookmarks = (options) => {
    return exports.db().store("bookmarks", {
        key: "url",
        indexes: [
            { name: "tags", options: { multiEntry: true, unique: false } },
            "cleanTitle",
            "cleanUrl",
            "createdAt"
        ]
    });
};
exports.collections = (options) => {
    return exports.db().store("collections", {
        key: "title",
        indexes: ["id", "desc", "createdAt"]
    });
};
exports.collectionLinks = (options) => {
    return exports.db().store("collection-links", {
        key: "key",
        indexes: ["collection", "createdAt"]
    });
};
function reset() {
    dbref = null;
}
exports.reset = reset;
