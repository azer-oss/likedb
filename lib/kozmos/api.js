class API {
  constructor(options) {
    this.host = options.host || "https://getkozmos.com"
    this.apiKey = options.apiKey
    this.apiSecret = options.apiSecret
    this.deprecatedToken = options.deprecatedToken
  }

  get(url, callback) {
    this.sendJSON("GET", url, null, callback)
  }

  post(url, data, callback) {
    this.sendJSON("POST", url, data, callback)
  }

  put(url, data, callback) {
    this.sendJSON("PUT", url, data, callback)
  }

  delete(url, data, callback) {
    this.sendJSON("DELETE", url, data, callback)
  }

  sendJSON(method, url, data, callback) {
    var xmlhttp = new XMLHttpRequest()
    xmlhttp.open(method, this.host + url)

    if (this.apiKey && this.apiSecret) {
      xmlhttp.setRequestHeader("X-API-Key", this.apiKey)
      xmlhttp.setRequestHeader("X-API-Secret", this.apiSecret)
    } else {
      xmlhttp.setRequestHeader("X-API-Token", this.deprecatedToken)
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

module.exports = API
