import Servers from "./servers";
import IndexedDBPull from "./indexeddb-pull";
import LikeDB from "../index";
import * as types from "./types";
declare const _default: (likedb: LikeDB, options: types.IAPIOptions) => {
    servers: Servers;
    pull: IndexedDBPull;
};
export default _default;
