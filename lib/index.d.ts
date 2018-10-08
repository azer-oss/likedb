import * as types from "./src/types";
import { IDBOptions, IListOptions } from "./src/types";
export default class LikeDB {
    options: IDBOptions;
    store: any;
    constructor(options?: types.IDBOptions);
    add(options: types.INewBookmark): Promise<any>;
    count(): Promise<number>;
    delete(url: string): Promise<any>;
    get(url: string): Promise<types.IBookmark>;
    listByTag(tag: string, options?: types.IListOptions): Promise<types.IBookmark[]>;
    recent(limit: number): Promise<types.IBookmark[]>;
    search(index: string, keyword: string, options?: IListOptions): Promise<types.IBookmark[]>;
    searchByTags(keyword: string, options: types.IListOptions): Promise<types.IBookmark[]>;
    searchByTitle(keyword: string, options: types.IListOptions): Promise<types.IBookmark[]>;
    searchByUrl(keyword: string, options: types.IListOptions): Promise<types.IBookmark[]>;
    untag(url: string, tag: string): Promise<any>;
    updateTitle(url: string, title: string): Promise<any>;
    tag(url: string, tag: string): Promise<any>;
    deleteDB(): Promise<any>;
}
