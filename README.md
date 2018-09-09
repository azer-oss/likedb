
## likedb

Offline bookmarking database with auto-sync to [Kozmos](https://kozmos.cool).

## Install

```bash
$ yarn add kozmos/likedb
```

## Manual

Initialize a new database and hook it with Kozmos to get it synced automatically;

```js
import LikeDB from 'likedb'
import syncWithKozmos from 'likedb/lib/kozmos'

const likedb = new LikeDB()
const sync = syncWithKozmos(likedb, {
  apiKey: "kozmos-api-key",
  apiSecret: "kozmos-api-secret"
  onPostUpdates: updates => console.log("Posted updates: ", updates),
  onReceiveUpdates: updates => console.log("Received updates: ", updates)
})
```

That's it. Now you have a bookmarking database based on indexeddb, and it'll
auto-sync to [Kozmos](https://kozmos.cool).

### `.add`

Create a new bookmark:

```js
await likedb.add({ title: "Wikipedia", url: "https://en.wikipedia.org" })
```

### `.count`

Get number of total bookmarks saved:

```js
await likedb.count()
```

### `.delete`

Delete a bookmark by URL:

```js
await likedb.delete("https://en.wikipedia.org")
```

### `.get` 

Get a bookmark by URL:

```js
const bookmark = await likedb.get("https://en.wikipedia.org")
```

### `.listByTag`

```js
const result = await likedb.listByTag("foobar")
```

### `.recent`

List recently added bookmarks. Requires a limit parameter.

```js
const last10bookmarks = await likedb.recent(10)
```

### `.searchByTags(keyword, { offset: 0, limit: 10 })`

Returns bookmarks with tags matching given keyword. For example, if a bookmark is tagged by `foobar`,
it'll return for search term such as `fo`;

```js
const results = await likedb.searchByTags("fo")

results[0].tags
// => ["foobar"]
```

### `.searchByTitle(keyword, { offset: 0, limit: 10 })`

Returns bookmarks with title matching given keyword.

```js
const results = await likedb.searchByTitle("wik")

results[0].title
// => Wikipedia
```

### `.searchByUrl(keyword, { offset: 0, limit: 10 })`

Returns bookmarks with url matching given keyword.

```js
const results = await likedb.searchByUrl("you")

results[0].url
// => https://youtube.com
```
