"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const indexeddb_1 = require("indexeddb");
const version_1 = require("./version");
let dbref = null;
exports.db = (options) => {
    if (dbref !== null) {
        return dbref;
    }
    const dbname = options && options.testing ? "kozmos-test-" + Date.now() : "kozmos";
    dbref = indexeddb_1.default(dbname, {
        version: (options && options.version) || version_1.default
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
        indexes: ["normalizedTitle", "desc", "createdAt"]
    });
};
exports.collectionLinks = (options) => {
    return exports.db().store("collection-links", {
        key: "key",
        indexes: ["collection", "url", "createdAt"]
    });
};
exports.speedDial = (options) => {
    return exports.db().store("speed-dial", {
        key: "key",
        indexes: ["key", "url", "createdAt"]
    });
};
function reset() {
    dbref = null;
}
exports.reset = reset;
