import { IndexedDBPull, types as idbTypes } from "indexeddb"
import * as anglicize from "anglicize"
import { sanitizeBookmark, sanitizeCollection } from "../sanitize"
import * as types from "./types"

// Receives updates from other sources
export default class CustomIndexedDBPull extends IndexedDBPull {
  async copyUpdate(update: idbTypes.IUpdate, callback: idbTypes.ICallback) {
    const store = this.stores()[update.store]
    if (!store) return callback(new Error("Unknown store: " + update.store))

    if (await shouldBeAnUpdateAction(store, update)) {
      update.action = "update"
    }

    if (update.store === "collections" && update.action !== "delete") {
      update.doc = sanitizeCollection(update.doc)
    }

    if (update.store === "bookmarks" && update.action !== "delete") {
      update.doc = sanitizeBookmark(update.doc)
    }

    return super.copyUpdate(update, callback)
  }
}

async function shouldBeAnUpdateAction(
  store: idbTypes.IStore,
  update: idbTypes.IUpdate
): Promise<boolean> {
  if (update.action !== "add") return false

  const existing = await store.get(update.documentId)
  return !!existing
}
