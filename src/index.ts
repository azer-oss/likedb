import sanitize from "./sanitize"
import getStore from "./store"
import * as types from "./types"
import { IDBOptions, IListOptions } from "./types"

const DEFAULT_OFFSET = 0
const DEFAULT_LIMIT = 10

export default class LikeDB {
  options: IDBOptions
  store: any

  constructor(options?: types.IDBOptions) {
    this.options = options || {}
    this.store = getStore(this.options)
  }

  add(options: types.INewBookmark): Promise<any> {
    return this.store.add(
      sanitize({
        url: options.url,
        title: options.title || "",
        tags: options.tags || [],
        createdAt: options.createdAt || Date.now(),
        updatedAt: Date.now()
      })
    )
  }

  count(): Promise<number> {
    return this.store.count()
  }

  delete(url: string): Promise<any> {
    return this.store.delete(url)
  }

  get(url: string): Promise<types.IBookmark> {
    return this.store.get(url)
  }

  listByTag(
    tag: string,
    options?: types.IListOptions
  ): Promise<types.IBookmark[]> {
    const result: types.IBookmark[] = []
    const limit: number = options && options.limit ? options.limit : 25

    return new Promise((resolve, reject) => {
      this.store.select(
        "tags",
        { only: tag },
        (err?: Error, row?: types.IDBRow) => {
          if (err) return reject(err)
          if (!row || result.length >= limit) {
            return resolve(result.sort(sortByCreatedAt))
          }

          result.push(row.value)
          row.continue()
        }
      )
    })
  }

  recent(limit: number): Promise<types.IBookmark[]> {
    const result: types.IBookmark[] = []

    return new Promise((resolve, reject) => {
      this.store.select(
        "createdAt",
        null,
        "prev",
        (err: Error, row: types.IDBRow) => {
          if (err) return reject(err)
          if (!row || result.length >= limit) {
            return resolve(result.sort(sortByCreatedAt))
          }

          result.push(row.value)
          row.continue()
        }
      )
    })
  }

  search(
    index: string,
    keyword: string,
    options?: IListOptions
  ): Promise<types.IBookmark[]> {
    const result: types.IBookmark[] = []
    const offset: number =
      options && options.offset ? options.offset : DEFAULT_OFFSET
    const limit: number =
      options && options.limit ? options.limit : DEFAULT_LIMIT

    let i = 0

    return new Promise((resolve, reject) => {
      this.store.select(
        index,
        { from: keyword, to: keyword + "\uffff" },
        "prev",
        (err: Error, row: types.IDBRow) => {
          if (err) return reject(err)
          if (!row || result.length >= limit)
            return resolve(result.sort(sortByCreatedAt))

          if (i++ >= offset) {
            result.push(row.value)
          }

          row.continue()
        }
      )
    })
  }

  searchByTags(
    keyword: string,
    options: types.IListOptions
  ): Promise<types.IBookmark[]> {
    return this.search("tags", keyword, options || {})
  }

  searchByTitle(
    keyword: string,
    options: types.IListOptions
  ): Promise<types.IBookmark[]> {
    return this.search("cleanTitle", keyword, options || {})
  }

  searchByUrl(
    keyword: string,
    options: types.IListOptions
  ): Promise<types.IBookmark[]> {
    return this.search("cleanUrl", keyword, options || {})
  }

  untag(url: string, tag: string): Promise<any> {
    return this.store.get(url).then((row: types.IBookmarkWithTags) => {
      const index = row.tags ? row.tags.indexOf(tag) : -1

      if (index === -1) {
        throw new Error("Tag doesn't exist")
      }

      row.tags.splice(index, 1)
      row.updatedAt = Date.now()
      return this.store.update(row)
    })
  }

  updateTitle(url: string, title: string): Promise<any> {
    return this.store.get(url).then((row: types.IBookmark) => {
      row.title = title
      row.updatedAt = Date.now()
      return this.store.update(sanitize(row))
    })
  }

  tag(url: string, tag: string): Promise<any> {
    return this.store.get(url).then((row: types.IBookmark) => {
      if (!row.tags) {
        row.tags = [tag]
        row.updatedAt = Date.now()
        return this.store.update(row)
      }

      if (row.tags.indexOf(tag) > -1) {
        throw new Error("Tag already added")
      }

      row.tags.push(tag)
      row.updatedAt = Date.now()
      return this.store.update(row)
    })
  }

  deleteDB(): Promise<any> {
    return this.store.db.delete()
  }
}

function sortByCreatedAt(a: types.IBookmark, b: types.IBookmark): number {
  if (a.createdAt > b.createdAt) {
    return -1
  }

  if (a.createdAt < b.createdAt) {
    return 1
  }

  return 0
}
