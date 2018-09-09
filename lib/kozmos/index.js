const Servers = require("./servers")
const IndexedDBPull = require("./indexeddb-pull")

module.exports = (likedb, options) => {
  const servers = new Servers(options)
  const pull = new IndexedDBPull(likedb.store.db)

  likedb.store.db.sync(servers)
  likedb.store.db.pull = pull

  return {
    servers,
    pull
  }
}
