const syncdb = require("./sync-db")

class PostQueue {
  constructor(servers, options) {
    this.servers = servers
    this.scheduledAt = 0
    this.lastPostedAt = 0

    // Updates will be accumulated and be sent periodically
    // We define how often we'll post updates to Kozmos servers here.
    this.interval = options.postIntervalSecs || 15 // seconds

    // if an error happens, retry in this period of time.
    this.retryInterval = this.interval * 10

    this.store = syncdb.store('updates', {
      indexes: [
        'queuedAt'
      ]
    })

    this.schedule()
  }

  add (updates, callback) {
    Promise.all(updates.map(update => this.store.add(update)))
      .catch(err => callback(err))
      .then(() => {
        this.schedule()
        callback()
      })
  }

  schedule() {
    if (this.scheduledAt > 0) {
      // Already scheduled
      return
    }

    this.scheduledAt = Date.now()

    let interval = this.interval * 1000

    // If user didn't post since more than the interval
    // Post immediately without wait
    if (this.lastPostedAt < Date.now() - interval) {
      interval = 0
    }

    console.log('scheduled to send updates', interval)
    this.scheduler = setTimeout(() => this.post(), interval)
  }

  all(callback) {
    const updates = []

    this.store.all((error, row) => {
      if (error) return callback(error)
      if (!row) return callback(undefined, updates)

      updates.push(row.value)
      row.continue()
    })
  }

  post() {
    this.lastPostedAt = Date.now()
    this.scheduler = undefined
    this.scheduledAt = 0

    console.log('posting updates (if there is any)')

    this.all((err, rows) => {
      if (err) return this.onError(err)
      if (rows.length === 0) return

      console.log('sending server %d updates, hold on...', rows.length)

      this.servers.post('/api/sync', { content: rows }, (err, result) => {
        if (err) return this.onPostError(err)

        // Delete all rows from the store
        Promise.all(rows.map(row => this.store.delete(row.id)))
          .catch(err => this.onError(err))

        if (this.servers.onPostUpdates) {
          this.servers.onPostUpdates(result)
        }
      })
    })
  }

  onError(err) {
    console.error('Error on post-queue', err)
  }

  onPostError(err) {
    console.error('Error on posting updates to server', err)
    this.schedule()
  }
}

module.exports = PostQueue
