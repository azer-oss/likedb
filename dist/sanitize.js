"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const anglicize = require("anglicize");
const urls_1 = require("urls");
function sanitize(bookmark) {
    delete bookmark.raw_url;
    return Object.assign(Object.assign({}, bookmark), { cleanUrl: urls_1.clean(bookmark.url), cleanTitle: title(bookmark.title) });
}
exports.default = sanitize;
function title(title) {
    if (!title)
        return "";
    return anglicize(title.trim().toLowerCase());
}
