import Servers from "./servers"
import IndexedDBPull from "./indexeddb-pull"
import LikeDB from "../index"
import * as types from "./types"

export default (likedb: LikeDB, options: types.IAPIOptions) => {
  const servers = new Servers(options)
  const pull = new IndexedDBPull(likedb.db)

  likedb.db.sync(servers)
  likedb.db.pull = pull

  return {
    servers,
    pull
  }
}
