const Push = require("indexeddb/lib/push")
const loop = require("parallel-loop")
const syncdb = require("./sync-db")

// This class is for taking new updates from Kozmos servers,
// and publishing them to user's offline databases.
class PushForServers extends Push {
  constructor(servers) {
    super()
    this.servers = servers
    this.interval = 15 // seconds
    this.scheduler = undefined
    this.scheduledAt = 0
    this.lastSyncedAt = 0
    this.until = 0

    this.store = syncdb.store('pushlogs', {
      key: { autoIncrement: true, keyPath: 'id' },
      indexes: [
        "id"
      ]
    })

    this.schedule()
  }

  schedule(customInterval) {
    if (this.scheduledAt > 0) {
      // Already scheduled
      return
    }

    this.scheduledAt = Date.now()

    let interval = this.interval * 1000

    // If user didn't check for updates since more than the interval
    // Check for updates immediately without wait
    if (this.lastSyncedAt < Date.now() - interval) {
      interval = 0
    }

    if (customInterval !== undefined) {
      interval = customInterval
    }

    this.scheduler = setTimeout(() => this.checkForUpdates(), interval)
  }

  abortScheduler () {
    if (this.scheduledAt == 0 || this.scheduler === undefined) return

    try {
      clearTimeout(this.scheduler)
      this.scheduler = undefined
      this.scheduledAt = 0
      console.log('aborted current scheduler')
    } catch (err) {}
  }

  checkForUpdates() {
    this.lastSyncedAt = Date.now()
    this.scheduler = undefined
    this.scheduledAt = 0

    setTimeout(() => this.schedule(), 0)

    this.getPushLog((err, log) => {
      if (err) return this.onError(err)

      console.log('push log currently', log && log.until)

      this.servers.get('/api/sync/' + (log ? log.until : 0), (err, updates) => {
        if (err) return this.onError(err)
        if (!updates.content || updates.content.length === 0) return

        this.sendUpdates(updates)

        if (updates.content.length >= 250) {
          this.abortScheduler()
          this.schedule(2000)
        }

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
