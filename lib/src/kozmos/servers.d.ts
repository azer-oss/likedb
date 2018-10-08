import API from ".api";
import * as types from "./types";
export default class Servers extends API {
    constructor(options: types.IAPIOptions);
    onError(error: Error, action: string): void;
}
