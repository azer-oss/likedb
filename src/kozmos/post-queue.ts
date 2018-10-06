import Scheduler from "./scheduler"
import syncdb from "./sync-db"
import Servers from "./servers"
import * as types from "./types"
import { types as idbTypes } from "indexeddb"

export default class PostQueue {
  scheduler: Scheduler
  servers: Servers
  store: idbTypes.IStore
  retryInterval: number
  constructor(servers: Servers, options: types.IAPIOptions) {
    this.servers = servers
    this.retryInterval = options.postRetryIntervalSecs || 10
    this.scheduler = new Scheduler({
      interval: options.postIntervalSecs || 1.5,
      fn: () => this.post()
    })

    this.store = syncdb.store("updates", {
      indexes: ["queuedAt"]
    })

    this.scheduler.schedule()
  }

  add(updates: idbTypes.IUpdate[], callback: types.ICallback) {
    Promise.all(updates.map(update => this.store.add(update)))
      .catch(err => callback(err))
      .then(() => {
        this.scheduler.schedule()
        callback()
      })
  }

  all(callback: types.ICallback) {
    const updates: idbTypes.IUpdate[] = []

    this.store.all((error, row) => {
      if (error) return callback(error)
      if (!row) return callback(undefined, updates)

      updates.push(row.value)
      row.continue()
    })
  }

  post() {
    this.all((err, rows) => {
      if (err) return this.onError(err)
      if (rows.length === 0) return

      console.log("Sending server %d updates, hold on...", rows.length)

      this.servers.post("/api/updates", { content: rows }, (err, result) => {
        if (err) return this.onHTTPError(err)

        // Delete all rows from the store
        Promise.all(rows.map(row => this.store.delete(row.id))).catch(err =>
          this.onError(err)
        )

        if (this.servers.onPostUpdates) {
          this.servers.onPostUpdates(result)
        }
      })
    })
  }

  onError(err) {
    this.servers.onError(err, "sync-queue")
  }

  onHTTPError(err) {
    this.servers.onError(err, "sync-request")
    this.scheduler.reschedule(this.retryInterval)
  }
}
