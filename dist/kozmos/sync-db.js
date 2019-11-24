"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const indexeddb_1 = require("indexeddb");
exports.default = indexeddb_1.default("sync", {
    version: 1
});
