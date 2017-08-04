const Servers = require("./lib/servers")
const stores = require("./lib/stores")
const IndexedDBPull = require("./lib/indexeddb-pull")


module.exports = options => {
  stores.servers = new Servers(options)
  stores.db.sync(stores.servers)
  stores.db.pull = new IndexedDBPull(stores.db)
  return stores
}
