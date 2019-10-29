import { IDB, IStore } from "indexeddb";
import * as types from "./types";
export default class LikeDB {
    options: types.IDBOptions;
    db: IDB;
    bookmarksStore: IStore;
    collectionsStore: IStore;
    collectionLinksStore: IStore;
    speedDialStore: IStore;
    constructor(options?: types.IDBOptions);
    add(options: types.INewBookmark): Promise<any>;
    count(): Promise<number>;
    delete(url: string): Promise<any>;
    get(url: string): Promise<types.IBookmark>;
    listByTag(tag: string, options?: types.IListOptions): Promise<types.IBookmark[]>;
    recent(limit: number): Promise<types.IBookmark[]>;
    createCollection({ title, desc }: {
        title: string;
        desc: string;
    }): Promise<types.ICollection>;
    getCollection(title: string): Promise<types.ICollection>;
    addToCollection({ collection, url, title, desc }: {
        collection: string;
        url: string;
        title: string;
        desc: string;
    }): Promise<types.ICollectionLink>;
    getCollectionsOfUrl(url: string): Promise<types.ICollection[]>;
    removeFromCollection(url: string, collection: string): Promise<object>;
    listCollections(): Promise<types.ICollection[]>;
    getRecentCollections(): Promise<types.ICollection[]>;
    searchCollections(query: string): Promise<types.ICollection[]>;
    listByCollection(collection: string, options?: types.IListOptions): Promise<types.ICollectionLink[]>;
    addSpeedDial({ key, url }: {
        key: string;
        url: string;
    }): Promise<types.ISpeedDial>;
    getSpeedDialByKey(key: string): Promise<types.ISpeedDial>;
    getSpeedDialByUrl(url: string): Promise<types.ISpeedDial>;
    updateSpeedDial({ key, url }: {
        key: string;
        url: string;
    }): Promise<types.ISpeedDial>;
    removeSpeedDial(key: string): Promise<object>;
    removeSpeedDialByUrl(url: string): Promise<object>;
    listSpeedDials(): Promise<types.ISpeedDial[]>;
    searchSpeedDials(query: string): Promise<types.ISpeedDial[]>;
    search(index: string, keyword: string, options?: types.IListOptions): Promise<types.IBookmark[]>;
    searchByTags(keyword: string, options: types.IListOptions): Promise<types.IBookmark[]>;
    searchByTitle(keyword: string, options: types.IListOptions): Promise<types.IBookmark[]>;
    searchByUrl(keyword: string, options: types.IListOptions): Promise<types.IBookmark[]>;
    untag(url: string, tag: string): Promise<any>;
    updateTitle(url: string, title: string): Promise<any>;
    tag(url: string, tag: string): Promise<any>;
    deleteDB(): Promise<any>;
}
