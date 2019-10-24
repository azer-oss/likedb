"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const anglicize = require("anglicize");
const urls_1 = require("urls");
function sanitizeBookmark(bookmark) {
    delete bookmark.raw_url;
    return Object.assign(Object.assign({}, bookmark), { cleanUrl: urls_1.clean(bookmark.url), cleanTitle: title(bookmark.title) });
}
exports.sanitizeBookmark = sanitizeBookmark;
function sanitizeCollection(collection) {
    return Object.assign(Object.assign({}, collection), { normalizedTitle: sanitizeSearchQuery(collection.title) });
}
exports.sanitizeCollection = sanitizeCollection;
function sanitizeSearchQuery(query) {
    return anglicize(query)
        .toLowerCase()
        .replace(/[^\w\s]+/g, " ")
        .split(/\s+/g)
        .join(" ");
}
exports.sanitizeSearchQuery = sanitizeSearchQuery;
function title(title) {
    if (!title)
        return "";
    return anglicize(title.trim().toLowerCase());
}
