import Servers from "./servers"
import IndexedDBPull from "./indexeddb-pull"
import LikeDB from "../../index"
import * as types from "./types"

export default (likedb: LikeDB, options: types.IAPIOptions) => {
  const servers = new Servers(options)
  const pull = new IndexedDBPull(likedb.store.db)

  likedb.store.db.sync(servers)
  likedb.store.db.pull = pull

  return {
    servers,
    pull
  }
}
