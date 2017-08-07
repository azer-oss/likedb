const Servers = require("./lib/servers")
const IndexedDBPull = require("./lib/indexeddb-pull")
const stores = require("./lib/stores")

module.exports = options => {
  stores.servers = new Servers(options)
  stores.db.sync(stores.servers)
  stores.db.pull = new IndexedDBPull(stores.db)
  return stores
}
