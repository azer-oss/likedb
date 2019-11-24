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
const version_1 = require("./version");
const DEFAULT_OFFSET = 0;
const DEFAULT_LIMIT = 10;
class LikeDB {
    constructor(options) {
        this.options = options || { version: version_1.default };
        this.db = storage.db(this.options);
        this.bookmarksStore = storage.bookmarks(this.options);
        this.collectionsStore = storage.collections(this.options);
        this.collectionLinksStore = storage.collectionLinks(this.options);
        this.speedDialStore = storage.speedDial(this.options);
    }
    add(options) {
        return this.bookmarksStore.add(sanitize_1.sanitizeBookmark({
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
        return this.collectionsStore.add(sanitize_1.sanitizeCollection({
            id: Date.now(),
            title,
            desc,
            createdAt: Date.now(),
            updatedAt: Date.now()
        }));
    }
    updateCollection(titleToUpdate, { title, desc }) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = yield this.createCollection({ title, desc });
            const links = yield this.listByCollection(titleToUpdate, { limit: 99999 });
            yield Promise.all(links.map(link => this.addToCollection(Object.assign(Object.assign({}, link), { collection: collection }))));
            yield this.removeCollection(titleToUpdate);
        });
    }
    updateCollectionImage(title, imageUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = (yield this.collectionsStore.get(title));
            return this.collectionsStore.update(Object.assign(Object.assign({}, existing), { imageUrl, updatedAt: Date.now() }));
        });
    }
    removeCollection(title) {
        return __awaiter(this, void 0, void 0, function* () {
            const links = yield this.listByCollection(title, { limit: 99999 });
            yield Promise.all(links.map(link => this.removeFromCollection(link.url, title)));
            yield this.collectionsStore.delete(title);
        });
    }
    getCollection(title) {
        return this.collectionsStore.get(title);
    }
    addToCollection({ collection, url, title, desc, createdAt, updatedAt }) {
        return __awaiter(this, void 0, void 0, function* () {
            const coll = yield this.getCollection(collection);
            if (!coll) {
                yield this.createCollection({ title: collection, desc: "" });
            }
            return this.collectionLinksStore.add({
                key: `${collection}:${url}`,
                collection,
                url,
                createdAt: createdAt || Date.now(),
                updatedAt: updatedAt || Date.now()
            });
        });
    }
    getCollectionsOfUrl(url) {
        const result = [];
        return new Promise((resolve, reject) => {
            return this.collectionLinksStore.select("url", { only: url }, (err, row) => __awaiter(this, void 0, void 0, function* () {
                if (err)
                    return reject(err);
                if (!row) {
                    return resolve(yield Promise.all(result
                        .sort(sortCollByCreatedAt)
                        .map(collectionLinkToCollection(this.collectionsStore))));
                }
                result.push(row.value);
                row.continue();
            }));
        });
    }
    removeFromCollection(url, collection) {
        return this.collectionLinksStore.delete(`${collection}:${url}`);
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
    getRecentCollections() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = [];
            const recentlyCreatedColls = (yield this.listCollections()).reverse();
            return new Promise((resolve, reject) => {
                this.collectionLinksStore.all((err, row) => __awaiter(this, void 0, void 0, function* () {
                    if (err)
                        return reject(err);
                    if (!row) {
                        return resolve((yield Promise.all(result.map(collectionLinkToCollection(this.collectionsStore))))
                            .concat(yield this.listCollections())
                            .filter(isUniqueCollection()));
                    }
                    result.push(row.value);
                    row.continue();
                }));
            });
        });
    }
    searchCollections(query) {
        const result = [];
        query = sanitize_1.sanitizeSearchQuery(query);
        return new Promise((resolve, reject) => {
            this.collectionsStore.select("normalizedTitle", { from: query, to: query + "\uffff" }, "prev", (err, row) => {
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
        const all = [];
        const result = [];
        const offset = options && options.offset ? options.offset : 0;
        const limit = options && options.limit ? options.limit : 25;
        const filter = (options && options.filter && options.filter.trim()) || "";
        let index = 0;
        return new Promise((resolve, reject) => {
            this.collectionLinksStore.select("createdAt", null, "prev", (err, row) => __awaiter(this, void 0, void 0, function* () {
                if (err)
                    return reject(err);
                if (!row || result.length >= limit) {
                    return resolve(result.sort(sortByCreatedAt));
                }
                if (offset > 0 && index < offset) {
                    index += 1;
                    return row.continue();
                }
                if (row.value.collection === collection) {
                    result.push(row.value);
                }
                index += 1;
                row.continue();
            }));
        });
        /*const result: types.ICollectionLink[] = []
        const offset: number = options && options.offset ? options.offset : 0
        const limit: number = options && options.limit ? options.limit : 25
        const filter: string =
          (options && options.filter && options.filter.trim()) || ""
    
        let index = 0
    
        return new Promise((resolve, reject) => {
          this.collectionLinksStore.select(
            "collection",
            { only: collection },
            async (err?: Error, row?: types.IDBRow<types.ICollectionLink>) => {
              if (err) return reject(err)
    
              if (!row || result.length >= limit) {
                return resolve(result.sort(sortByCreatedAt))
              }
    
              if (offset > 0 && index < offset) {
                return row.continue()
              }
    
              result.push(row.value)
    
              index += 1
              row.continue()
            }
          )
        })*/
    }
    addSpeedDial({ key, url }) {
        return this.speedDialStore.add({
            key,
            url,
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
    }
    getSpeedDialByKey(key) {
        return this.speedDialStore.get(key);
    }
    getSpeedDialByUrl(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield this.speedDialStore.getByIndex("url", url);
            return existing;
        });
    }
    updateSpeedDial({ key, url }) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield this.speedDialStore.getByIndex("url", url);
            yield this.speedDialStore.delete(existing.key);
            return this.speedDialStore.update({
                key,
                url,
                createdAt: existing.createdAt,
                updatedAt: Date.now()
            });
        });
    }
    removeSpeedDial(key) {
        return this.speedDialStore.delete(key);
    }
    removeSpeedDialByUrl(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const current = yield this.getSpeedDialByUrl(url);
            if (!current) {
                return {};
            }
            return this.speedDialStore.delete(current.key);
        });
    }
    listSpeedDials() {
        const result = [];
        return new Promise((resolve, reject) => {
            this.speedDialStore.all((err, row) => {
                if (err)
                    return reject(err);
                if (!row) {
                    return resolve(result.sort(sortSpeedDialByCreatedAt));
                }
                result.push(row.value);
                row.continue();
            });
        });
    }
    searchSpeedDials(query) {
        const result = [];
        query = sanitize_1.sanitizeSearchQuery(query);
        return new Promise((resolve, reject) => {
            this.speedDialStore.select("key", { from: query, to: query + "\uffff" }, "prev", (err, row) => {
                if (err)
                    return reject(err);
                if (!row) {
                    return resolve(result.sort(sortSpeedDialByCreatedAt));
                }
                result.push(row.value);
                row.continue();
            });
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
        return __awaiter(this, void 0, void 0, function* () {
            const row = (yield this.bookmarksStore.get(url));
            row.title = title;
            row.updatedAt = Date.now();
            return this.bookmarksStore.update(sanitize_1.sanitizeBookmark(row));
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
function sortCollLinksByCreatedAt(a, b) {
    if (a.createdAt > b.createdAt) {
        return 1;
    }
    if (a.createdAt < b.createdAt) {
        return -1;
    }
    return 0;
}
function sortSpeedDialByCreatedAt(a, b) {
    if (a.createdAt < b.createdAt) {
        return 1;
    }
    if (a.createdAt > b.createdAt) {
        return -1;
    }
    return 0;
}
function isUniqueCollection() {
    const mem = {};
    return function (coll) {
        if (mem[coll.title]) {
            return false;
        }
        mem[coll.title] = true;
        return true;
    };
}
function collectionLinkToCollection(collectionsStore) {
    return function (cl) {
        return collectionsStore.get(cl.collection);
    };
}
