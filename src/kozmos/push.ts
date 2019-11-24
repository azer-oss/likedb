import { Push, types as idbTypes } from "indexeddb"
import Scheduler from "./scheduler"
import syncdb from "./sync-db"
import Servers from "./servers"
import * as types from "./types"

// This class is for fetching new updates from Kozmos servers,
// and publishing them to user's offline database.
export default class PushForServers extends Push {
  servers: Servers
  scheduler: Scheduler
  store: idbTypes.IStore

  constructor(servers: Servers, options: types.IAPIOptions) {
    super()

    this.servers = servers
    this.scheduler = new Scheduler({
      interval: options.pushIntervalSecs || 15, // seconds
      fn: () => this.checkForUpdates()
    })

    this.store = syncdb.store("pushlogs", {
      key: { autoIncrement: true, keyPath: "id" },
      indexes: ["id", "store"]
    })

    this.scheduler.schedule()
  }

  async checkForUpdates() {
    const stores = [
      "bookmarks",
      "collections",
      "collection-links",
      "speed-dial"
    ]

    let i = stores.length
    let hasMore = false

    while (i--) {
      hasMore = await this.checkForStoreUpdates(stores[i])
      if (hasMore) {
        break
      }
    }

    console.log("has more?", stores[i], hasMore)
    this.scheduler.schedule(hasMore ? 1 : undefined)
  }

  checkForStoreUpdates(store: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.getPushLog(store, (err?: Error, log?: types.IPushLog) => {
        if (err) {
          return reject(err)
        }

        const endpoint: string =
          "/api/updates/" + store + "/" + (log ? log.until : 0)

        this.servers.get(endpoint, (err, updates: types.IAPIUpdates) => {
          if (err) {
            return reject(err)
          }

          if (!updates || !updates.content || updates.content.length === 0)
            return resolve(false)

          console.log("send updates", updates)

          this.sendUpdates(store, updates, err => {
            if (err) return this.onError(err)

            setTimeout(() => resolve(updates.has_more), 0)
          })
        })
      })
    })
  }

  sendUpdates(
    store: string,
    updates: types.IAPIUpdates,
    callback: idbTypes.ICallback
  ) {
    this.publish(updates.content, (errors?: Error[]) => {
      if (errors) return callback(errors[0])

      if (this.servers.onReceiveUpdates) {
        setTimeout(() => {
          if (this.servers.onReceiveUpdates) {
            this.servers.onReceiveUpdates(updates.content)
          }
        }, 0)
      }

      this.updatePushLog(store, updates.until, callback)
    })
  }

  updatePushLog(store: string, until: number, callback: idbTypes.ICallback) {
    console.log("update push log", store, until)

    this.getPushLog(store, (err?: Error, log?: types.IPushLog) => {
      if (!err && log) {
        log.until = until
        return this.store.update(log, callback)
      }

      this.store.add({ store, until }, callback)
    })
  }

  getPushLog(store: string, callback: idbTypes.ICallback) {
    this.store.select(
      "store",
      { only: store },
      (err?: Error, result?: { value: types.IPushLog }) => {
        if (err) return callback(err)
        if (!result) return callback()
        callback(undefined, result.value)
      }
    )
  }

  onError(err: Error) {
    this.servers.onError(err, "checking-updates")
  }
}
