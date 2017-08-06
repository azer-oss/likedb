const Push = require("indexeddb/lib/push")
const Scheduler = require("./scheduler")
const loop = require("parallel-loop")
const syncdb = require("./sync-db")


// This class is for taking new updates from Kozmos servers,
// and publishing them to user's offline databases.
class PushForServers extends Push {
  constructor(servers) {
    super()
    this.servers = servers
    this.scheduler = new Scheduler({
      interval: 15, // seconds
      fn: () => this.checkForUpdates()
    })

    this.store = syncdb.store('pushlogs', {
      key: { autoIncrement: true, keyPath: 'id' },
      indexes: [
        "id"
      ]
    })

    this.scheduler.schedule()
  }

  checkForUpdates() {
    this.getPushLog((err, log) => {
      if (err) return this.onError(err)

      this.servers.get('/api/sync/' + (log ? log.until : 0), (err, updates) => {
        if (err) return this.onError(err)
        if (!updates.content || updates.content.length === 0) return

        this.sendUpdates(updates)
        setTimeout(() => this.scheduler.schedule(), 0)
      })
    })
  }

  sendUpdates(updates) {
    this.publish(updates.content, err => {
      if (err) return this.onError(err)

      this.updatePushLog(updates.until)

      if (this.servers.onReceiveUpdates) {
        this.servers.onReceiveUpdates(updates)
      }
    })
  }

  updatePushLog(until, callback) {
    this.getPushLog((err, log) => {
      if (!err && log) {
        log.until = until
        return this.store.update(log, callback)
      }

      this.store.add({ until: until }, callback)
    })
  }

  getPushLog(callback) {
    this.store.all((err, result) => {
      if (err) return callback(err)
      if (!result) return callback()
      callback(undefined, result.value)
    })
  }

  onError(err) {
    console.error('Failed to check for updates: ', err)
  }
}

module.exports = PushForServers
