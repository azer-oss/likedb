"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const indexeddb_1 = require("indexeddb");
exports.default = (options) => {
    const dbname = options.testing
        ? "likedb-test-" + Math.floor(Math.random() * 100)
        : "likedb";
    const db = indexeddb_1.default(dbname, {
        version: 1
    });
    return db.store("bookmarks", {
        key: "url",
        indexes: [
            { name: "tags", options: { multiEntry: true, unique: false } },
            "cleanTitle",
            "cleanUrl",
            "createdAt"
        ]
    });
};
