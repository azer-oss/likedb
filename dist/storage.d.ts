import { IDB } from "indexeddb";
import { IDBOptions } from "./types";
export declare const db: (options?: IDBOptions | undefined) => IDB;
export declare const bookmarks: (options: IDBOptions) => any;
export declare const collections: (options: IDBOptions) => any;
export declare const collectionLinks: (options: IDBOptions) => any;
export declare const speedDial: (options: IDBOptions) => any;
export declare function reset(): void;
