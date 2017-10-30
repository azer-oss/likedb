const db = require("db")

db.likes.like = (url, title, callback) => {
  db.likes.get(url, (error, row) => {
    if (error || row) return callback(error)
    db.likes.add({ url, title }, callback)
  })
}

module.exports = db
