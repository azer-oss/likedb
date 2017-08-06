const Scheduler = require("./scheduler")
const syncdb = require("./sync-db")

class PostQueue {
  constructor(servers, options) {
    this.servers = servers
    this.scheduler = new Scheduler({
      interval: options.postIntervalSecs || 1.5,
      fn: () => this.post()
    })

    this.store = syncdb.store('updates', {
      indexes: [
        'queuedAt'
      ]
    })

    this.scheduler.schedule()
  }

  add (updates, callback) {
    Promise.all(updates.map(update => this.store.add(update)))
      .catch(err => callback(err))
      .then(() => {
        this.scheduler.schedule()
        callback()
      })
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
    this.scheduler.reschedule()
  }
}

module.exports = PostQueue
