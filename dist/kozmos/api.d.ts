import * as types from "./types";
export default class API {
    host: string;
    apiKey: string;
    apiSecret: string;
    constructor(options: types.IAPIOptions);
    get(url: string, callback: types.ICallback): void;
    post(url: string, data: any, callback: types.ICallback): void;
    put(url: string, data: any, callback: types.ICallback): void;
    delete(url: string, data: any, callback: types.ICallback): void;
    sendJSON(method: string, url: string, data: any, callback: types.ICallback): void;
}
