class API {
  constructor(options) {
    this.host = options.host
    this.token = options.token
  }

  get(url, callback) {
    this.sendJSON('GET', url, null, callback)
  }

  post(url, data, callback) {
    this.sendJSON('POST', url, data, callback)
  }

  put(url, data, callback) {
    this.sendJSON('PUT', url, data, callback)
  }

  delete(url, data, callback) {
    this.sendJSON('DELETE', url, data, callback)
  }

  sendJSON (method, url, data, callback) {
    if (!this.token) return callback(new Error('Token missing'))

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open(method, this.host + url);
    xmlhttp.setRequestHeader("X-API-Token", this.token)

    if (data) {
      xmlhttp.setRequestHeader("Content-Type", "application/json");
      xmlhttp.send(JSON.stringify(data));
    } else {
      xmlhttp.send(null);
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

      if (xmlhttp.status >= 300) {
        return callback(new Error('Request error: ' + xmlhttp.status))
      }

      callback(undefined, parsed)
    }
  }
}

module.exports = API
