const Pull = require("indexeddb/lib/indexeddb-pull")

class IndexedDBPull extends Pull {
  copyUpdate(update, callback) {
    const store = this.stores()[update.store]
    if (!store) return callback(new Error('Unknown store: ' + update.store))

    if (update.action !== 'add') {
      return super.copyUpdate(update, callback)
    }

    store.get(update.id, (err, result) => {
      if (!err && result) {
        update.action = 'update'
      }

      return super.copyUpdate(update, callback)
    })
  }
}

module.exports = IndexedDBPull
