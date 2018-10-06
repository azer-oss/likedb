import Pull from "./pull"
import Push from "./push"
import API from "./api"
import * as types from "./types"
import { types as idbTypes } from "indexeddb"

export default class Servers extends API {
  pull: Pull
  push: Push
  onPostUpdates?: (result: any) => void
  onReceiveUpdates?: (updates: idbTypes.IUpdate[]) => void
  onErrorParam?: (error: Error, action: string) => void
  constructor(options: types.IAPIOptions) {
    super(options)
    this.pull = new Pull(this, options)
    this.push = new Push(this, options)

    this.onPostUpdates = options.onPostUpdates
    this.onReceiveUpdates = options.onReceiveUpdates
    this.onErrorParam = options.onError
  }

  onError(error: Error, action: string) {
    if (this.onErrorParam) {
      this.onErrorParam(error, action)
    }
  }
}
