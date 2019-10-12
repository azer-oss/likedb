"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const servers_1 = require("./servers");
const indexeddb_pull_1 = require("./indexeddb-pull");
exports.default = (likedb, options) => {
    const servers = new servers_1.default(options);
    const pull = new indexeddb_pull_1.default(likedb.db);
    likedb.db.sync(servers);
    likedb.db.pull = pull;
    return {
        servers,
        pull
    };
};
