import indexeddb from "indexeddb"
import { IDBOptions } from "./types"

export default (options: IDBOptions) => {
  const dbname = options.testing
    ? "likedb-test-" + Math.floor(Math.random() * 100)
    : "likedb"

  const db = indexeddb(dbname, {
    version: 1
  })

  return db.store("bookmarks", {
    key: "url",
    indexes: [
      { name: "tags", options: { multiEntry: true, unique: false } },
      "cleanTitle",
      "cleanUrl",
      "createdAt"
    ]
  })
}
