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
const sanitize_1 = require("./sanitize");
const storage = require("./storage");
const DEFAULT_OFFSET = 0;
const DEFAULT_LIMIT = 10;
class LikeDB {
    constructor(options) {
        this.options = options || { version: 1 };
        this.db = storage.db(this.options);
        this.bookmarksStore = storage.bookmarks(this.options);
        this.collectionsStore = storage.collections(this.options);
        this.collectionLinksStore = storage.collectionLinks(this.options);
    }
    add(options) {
        return this.bookmarksStore.add(sanitize_1.default({
            url: options.url,
            title: options.title || "",
            tags: options.tags || [],
            createdAt: options.createdAt || Date.now(),
            updatedAt: Date.now()
        }));
    }
    count() {
        return this.bookmarksStore.count();
    }
    delete(url) {
        return this.bookmarksStore.delete(url);
    }
    get(url) {
        return this.bookmarksStore.get(url);
    }
    listByTag(tag, options) {
        const result = [];
        const limit = options && options.limit ? options.limit : 25;
        return new Promise((resolve, reject) => {
            this.bookmarksStore.select("tags", { only: tag }, (err, row) => {
                if (err)
                    return reject(err);
                if (!row || result.length >= limit) {
                    return resolve(result.sort(sortByCreatedAt));
                }
                result.push(row.value);
                row.continue();
            });
        });
    }
    recent(limit) {
        const result = [];
        return new Promise((resolve, reject) => {
            this.bookmarksStore.select("createdAt", null, "prev", (err, row) => {
                if (err)
                    return reject(err);
                if (!row || result.length >= limit) {
                    return resolve(result.sort(sortByCreatedAt));
                }
                result.push(row.value);
                row.continue();
            });
        });
    }
    createCollection({ title, desc }) {
        return this.collectionsStore.add({
            id: Date.now(),
            title,
            desc,
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
    }
    getCollection(title) {
        return this.collectionsStore.get(title);
    }
    addToCollection({ collection, url, title, desc }) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield this.get(url);
            if (!existing) {
                yield this.add({ url, title });
            }
            return this.collectionLinksStore.add({
                key: `${collection}:${url}`,
                collection,
                url,
                createdAt: Date.now(),
                updatedAt: Date.now()
            });
        });
    }
    listCollections() {
        const result = [];
        return new Promise((resolve, reject) => {
            this.collectionsStore.all((err, row) => {
                if (err)
                    return reject(err);
                if (!row) {
                    return resolve(result.sort(sortCollByCreatedAt));
                }
                result.push(row.value);
                row.continue();
            });
        });
    }
    listByCollection(collection, options) {
        const result = [];
        const limit = options && options.limit ? options.limit : 25;
        return new Promise((resolve, reject) => {
            this.collectionLinksStore.select("collection", { only: collection }, (err, row) => __awaiter(this, void 0, void 0, function* () {
                if (err)
                    return reject(err);
                if (!row || result.length >= limit) {
                    return resolve(yield Promise.all(result.sort(sortByCreatedAt).map(joinBookmarkAndLink(this))));
                }
                result.push(row.value);
                row.continue();
            }));
        });
    }
    search(index, keyword, options) {
        const result = [];
        const offset = options && options.offset ? options.offset : DEFAULT_OFFSET;
        const limit = options && options.limit ? options.limit : DEFAULT_LIMIT;
        let i = 0;
        return new Promise((resolve, reject) => {
            this.bookmarksStore.select(index, { from: keyword, to: keyword + "\uffff" }, "prev", (err, row) => {
                if (err)
                    return reject(err);
                if (!row || result.length >= limit)
                    return resolve(result.sort(sortByCreatedAt));
                if (i++ >= offset) {
                    result.push(row.value);
                }
                row.continue();
            });
        });
    }
    searchByTags(keyword, options) {
        return this.search("tags", keyword, options || {});
    }
    searchByTitle(keyword, options) {
        return this.search("cleanTitle", keyword, options || {});
    }
    searchByUrl(keyword, options) {
        return this.search("cleanUrl", keyword, options || {});
    }
    untag(url, tag) {
        return this.bookmarksStore.get(url).then((row) => {
            const index = row.tags ? row.tags.indexOf(tag) : -1;
            if (index === -1) {
                throw new Error("Tag doesn't exist");
            }
            row.tags.splice(index, 1);
            row.updatedAt = Date.now();
            return this.bookmarksStore.update(row);
        });
    }
    updateTitle(url, title) {
        return this.bookmarksStore.get(url).then((row) => {
            row.title = title;
            row.updatedAt = Date.now();
            return this.bookmarksStore.update(sanitize_1.default(row));
        });
    }
    tag(url, tag) {
        return this.bookmarksStore.get(url).then((row) => {
            if (!row.tags) {
                row.tags = [tag];
                row.updatedAt = Date.now();
                return this.bookmarksStore.update(row);
            }
            if (row.tags.indexOf(tag) > -1) {
                throw new Error("Tag already added");
            }
            row.tags.push(tag);
            row.updatedAt = Date.now();
            return this.bookmarksStore.update(row);
        });
    }
    deleteDB() {
        return this.db.delete();
    }
}
exports.default = LikeDB;
function joinBookmarkAndLink(db) {
    return function (link) {
        return __awaiter(this, void 0, void 0, function* () {
            const b = yield db.get(link.url);
            return Object.assign(Object.assign({}, link), { title: b.title });
        });
    };
}
function sortByCreatedAt(a, b) {
    if (a.createdAt > b.createdAt) {
        return -1;
    }
    if (a.createdAt < b.createdAt) {
        return 1;
    }
    return 0;
}
function sortCollByCreatedAt(a, b) {
    if (a.createdAt > b.createdAt) {
        return -1;
    }
    if (a.createdAt < b.createdAt) {
        return 1;
    }
    return 0;
}
