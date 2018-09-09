module.exports = ({ testing }) => {
  const dbname = testing
    ? "likedb-test-" + Math.floor(Math.random() * 100)
    : "likedb"

  const db = require("indexeddb")(dbname, {
    version: 1
  })

  return db.store("bookmarks", {
    key: "url",
    indexes: [
      { name: "tags", options: { multiEntry: true, unique: false } },
      "cleanTitle",
      "cleanUrl",
      "createdAt"
    ]
  })
}
