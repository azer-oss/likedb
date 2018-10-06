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
      indexes: ["id"]
    })

    this.scheduler.schedule()
  }

  checkForUpdates() {
    this.getPushLog((err?: Error, log?: types.IPushLog) => {
      if (err) {
        this.scheduler.schedule()
        return this.onError(err)
      }

      const endpoint: string = "/api/updates/" + (log ? log.until : 0)

      this.servers.get(endpoint, (err, updates: types.IAPIUpdates) => {
        if (err) {
          this.scheduler.schedule()
          return this.onError(err)
        }

        if (!updates || !updates.content || updates.content.length === 0)
          return this.scheduler.schedule()

        this.sendUpdates(updates, err => {
          if (err) return this.onError(err)

          setTimeout(
            () => this.scheduler.schedule(updates.has_more ? 1 : undefined),
            0
          )
        })
      })
    })
  }

  sendUpdates(updates: types.IAPIUpdates, callback: idbTypes.ICallback) {
    this.publish(updates.content, (errors?: Error[]) => {
      if (errors) return callback(errors[0])

      if (this.servers.onReceiveUpdates) {
        setTimeout(() => {
          if (this.servers.onReceiveUpdates) {
            this.servers.onReceiveUpdates(updates.content)
          }
        }, 0)
      }

      this.updatePushLog(updates.until, callback)
    })
  }

  updatePushLog(until: number, callback: idbTypes.ICallback) {
    this.getPushLog((err?: Error, log?: types.IPushLog) => {
      if (!err && log) {
        log.until = until
        return this.store.update(log, callback)
      }

      this.store.add({ until }, callback)
    })
  }

  getPushLog(callback: idbTypes.ICallback) {
    this.store.all((err?: Error, result?: { value: types.IPushLog }) => {
      if (err) return callback(err)
      if (!result) return callback()
      callback(undefined, result.value)
    })
  }

  onError(err: Error) {
    this.servers.onError(err, "checking-updates")
  }
}
