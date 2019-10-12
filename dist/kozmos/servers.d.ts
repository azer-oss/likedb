import Pull from "./pull";
import Push from "./push";
import API from "./api";
import * as types from "./types";
import { types as idbTypes } from "indexeddb";
export default class Servers extends API {
    pull: Pull;
    push: Push;
    onPostUpdates?: (result: any) => void;
    onReceiveUpdates?: (updates: idbTypes.IUpdate[]) => void;
    onErrorParam?: (error: Error, action: string) => void;
    constructor(options: types.IAPIOptions);
    onError(error: Error, action: string): void;
}
