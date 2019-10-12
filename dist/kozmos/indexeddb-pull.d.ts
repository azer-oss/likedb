import { IndexedDBPull, types as idbTypes } from "indexeddb";
export default class CustomIndexedDBPull extends IndexedDBPull {
    copyUpdate(update: idbTypes.IUpdate, callback: idbTypes.ICallback): Promise<void>;
}
