import * as types from "./types"

export default class API {
  host: string
  apiKey: string
  apiSecret: string

  constructor(options: types.IAPIOptions) {
    this.host = options.host || "https://getkozmos.com"
    this.apiKey = options.apiKey
    this.apiSecret = options.apiSecret
  }

  get(url: string, callback: types.ICallback) {
    this.sendJSON("GET", url, null, callback)
  }

  post(url: string, data: any, callback: types.ICallback) {
    this.sendJSON("POST", url, data, callback)
  }

  put(url: string, data: any, callback: types.ICallback) {
    this.sendJSON("PUT", url, data, callback)
  }

  delete(url: string, data: any, callback: types.ICallback) {
    this.sendJSON("DELETE", url, data, callback)
  }

  sendJSON(method: string, url: string, data: any, callback: types.ICallback) {
    var xmlhttp = new XMLHttpRequest()
    xmlhttp.open(method, this.host + url)

    if (this.apiKey && this.apiSecret) {
      xmlhttp.setRequestHeader("X-API-Key", this.apiKey)
      xmlhttp.setRequestHeader("X-API-Secret", this.apiSecret)
    }

    if (data) {
      xmlhttp.setRequestHeader("Content-Type", "application/json")
      xmlhttp.send(JSON.stringify(data))
    } else {
      xmlhttp.send(null)
    }

    xmlhttp.onreadystatechange = () => {
      if (xmlhttp.readyState !== 4) {
        return
      }

      let parsed

      try {
        parsed = JSON.parse(xmlhttp.responseText)
      } catch (err) {
        return callback(err)
      }

      if (xmlhttp.status >= 300 && parsed && parsed.error) {
        return callback(new Error(parsed.error))
      }

      if (xmlhttp.status == 401) {
        return callback(new Error("Unauthorized (401)"))
      }

      if (xmlhttp.status == 404) {
        return callback(new Error("Not found"))
      }

      if (xmlhttp.status >= 300) {
        return callback(new Error("Request error: " + xmlhttp.status))
      }

      callback(undefined, parsed)
    }
  }
}
