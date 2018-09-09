const anglicize = require("anglicize")
const url = require("urls").clean

module.exports = sanitize

function sanitize(bookmark) {
  delete bookmark.raw_url

  return {
    ...bookmark,
    cleanUrl: url(bookmark.url),
    cleanTitle: title(bookmark.title)
  }
}

function title(title) {
  if (!title) return ""
  return anglicize(title.trim().toLowerCase())
}
