## likedb

[Kozmos](https://getkozmos.com)' client-side database for keeping bookmarks offline in the browser using [indexeddb](https://github.com/azer/indexeddb). It periodically syncs with Kozmos servers.

## Install

```bash
$ npm install kozmos/likedb
```

## Usage

Add a page to likes:

```js
import db from 'likedb'

db.likes.like('github.com', err => console.error(err))
```

Delete a page from your likes:

```js
db.likes.unlike('github.com', err => console.error(err))
```

Check if a page is liked:

```js
db.likes.get('github.com', (error, doc) => {
  error
  // => undefined

  doc
  // => undefined
})
```

## Relation with Kaktüs

This library is based on [Kaktüs Web Browser's database library](https://github.com/kaktus/db). Although it only stores bookmarks,
in the future kaktüs' meta store and its builtin keyword search will be useful for implementing offline search.
