import * as types from "./types";
import { IDB, IStore } from "indexeddb";
export default class LikeDB {
    options: types.IDBOptions;
    db: IDB;
    bookmarksStore: IStore;
    collectionsStore: IStore;
    collectionLinksStore: IStore;
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
    listCollections(): Promise<types.ICollection[]>;
    listByCollection(collection: string, options?: types.IListOptions): Promise<types.ICollectionLink[]>;
    search(index: string, keyword: string, options?: types.IListOptions): Promise<types.IBookmark[]>;
    searchByTags(keyword: string, options: types.IListOptions): Promise<types.IBookmark[]>;
    searchByTitle(keyword: string, options: types.IListOptions): Promise<types.IBookmark[]>;
    searchByUrl(keyword: string, options: types.IListOptions): Promise<types.IBookmark[]>;
    untag(url: string, tag: string): Promise<any>;
    updateTitle(url: string, title: string): Promise<any>;
    tag(url: string, tag: string): Promise<any>;
    deleteDB(): Promise<any>;
}
