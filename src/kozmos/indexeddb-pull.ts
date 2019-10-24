import { IndexedDBPull, types as idbTypes } from "indexeddb"
import * as anglicize from "anglicize"
import { sanitizeBookmark, sanitizeCollection } from "../sanitize"
import * as types from "./types"

// Receives updates from other sources
export default class CustomIndexedDBPull extends IndexedDBPull {
  async copyUpdate(update: idbTypes.IUpdate, callback: idbTypes.ICallback) {
    const store = this.stores()[update.store]
    if (!store) return callback(new Error("Unknown store: " + update.store))

    if (update.store === "collections" && update.action !== "delete") {
      update.doc = sanitizeCollection(update.doc)
      return super.copyUpdate(update, callback)
    }

    if (update.store !== "bookmarks") {
      return super.copyUpdate(update, callback)
    }

    if (update.action !== "delete") {
      update.doc = sanitizeBookmark(update.doc)
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
