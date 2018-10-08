import Pull from "./pull"
import Push from "./push"
import API from ".api"
import * as types from "./types"

export default class Servers extends API {
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

module.exports = Servers
