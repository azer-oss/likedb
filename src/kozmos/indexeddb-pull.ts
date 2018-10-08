import { IndexedDBPull, types as idbTypes } from "indexeddb"
import sanitize from "../sanitize"
import * as types from "./types"

// Receives updates from other sources
export default class CustomIndexedDBPull extends IndexedDBPull {
  copyUpdate(update: idbTypes.IUpdate, callback: idbTypes.ICallback) {
    const store = this.stores()[update.store]
    if (!store) return callback(new Error("Unknown store: " + update.store))

    if (update.action !== "delete") {
      update.doc = sanitize(update.doc)
    }

    if (update.action !== "add") {
      return super.copyUpdate(update, callback)
    }

    store.get(update.documentId, (err, result) => {
      if (!err && result) {
        update.action = "update"
      }

      return super.copyUpdate(update, callback)
    })
  }
}
