import { IDBOptions as BaseIDBOptions } from "indexeddb";
interface EnableTestingMode {
    testing?: boolean;
}
export declare type IDBOptions = EnableTestingMode & BaseIDBOptions;
export interface INewBookmark {
    url: string;
    title?: string;
    tags?: string[];
    createdAt?: number;
}
export interface IBookmark {
    url: string;
    title: string;
    tags?: string[];
    createdAt: number;
    updatedAt: number;
}
export interface IBookmarkWithTags {
    url: string;
    title: string;
    tags: string[];
    createdAt: number;
    updatedAt: number;
}
export interface IListOptions {
    limit?: number;
    offset?: number;
}
export interface IDBRow<T> {
    continue: () => void;
    value: T;
}
export interface ICallback {
    (error?: Error, result?: any): void;
}
export interface ICollection {
    title: string;
    desc: string;
    createdAt: number;
    updatedAt: number;
}
export interface ICollectionLink {
    collection: string;
    url: string;
    title: string;
    desc: string;
    createdAt: number;
    updatedAt: number;
}
export interface ISpeedDial {
    key: string;
    url: string;
    createdAt: number;
    updatedAt: number;
}
export {};
