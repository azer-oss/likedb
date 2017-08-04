const Pull = require("indexeddb/lib/pull")
const PostQueue = require('./post-queue')

// Pull updates from source (offline DB), post it to Kozmos server
class PullForServers extends Pull {
  constructor(servers, options) {
    super()
    this.servers = servers
    this.postQueue = new PostQueue(this.servers, options)
  }

  // Only sync likes store
  filter (update) {
    return update.store === "likes"
  }

  // This function gets called whenever there is any updates.
  receive (updates, callback) {
    if (!Array.isArray(updates)) {
      updates = [updates]
    }

    this.postQueue.add(updates.filter(this.filter), callback)
  }
}

module.exports = PullForServers
