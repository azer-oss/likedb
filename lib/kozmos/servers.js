const Pull = require("./pull")
const Push = require("./push")
const API = require("./api")

class Servers extends API {
  constructor(options) {
    super(options)
    this.pull = new Pull(this, options)
    this.push = new Push(this, options)

    this.onPostUpdates = options.onPostUpdates
    this.onReceiveUpdates = options.onReceiveUpdates
    this.onErrorParam = options.onError
  }

  onError(error, action) {
    if (this.onErrorParam) {
      this.onErrorParam(error, action)
    }
  }
}

module.exports = Servers
