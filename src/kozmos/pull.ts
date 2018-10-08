import { Pull, types as idbTypes } from "indexeddb"
import PostQueue from "./post-queue"
import Servers from "./servers"
import * as types from "./types"

// Pull updates from source (offline DB), post it to Kozmos server
export default class PullForServers extends Pull {
  servers: Servers
  postQueue: PostQueue
  constructor(servers: Servers, options: types.IAPIOptions) {
    super()
    this.servers = servers
    this.postQueue = new PostQueue(this.servers, options)
  }

  // This function gets called whenever there is any updates.
  receive(updates: idbTypes.IUpdate[], callback: idbTypes.ICallback) {
    if (!Array.isArray(updates)) {
      updates = [updates]
    }

    this.postQueue.add(updates, callback)
  }
}
