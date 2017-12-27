## likedb

[Kozmos](https://getkozmos.com)' client-side database for keeping bookmarks offline in the browser using [indexeddb](https://github.com/azer/indexeddb). It syncs with Kozmos servers when user is online.

## Install

```bash
$ yarn add kozmos/likedb
```

## Usage

Initialize:

```js
import likedb from 'likedb'

const db = likedb({
  host: '',
  token: '',
  postIntervalSecs: 1.5, // Post updates -if there are any- every 1.5 seconds
  pushIntervalSecs: 60, // Check for updates every 60 seconds
  onPostUpdates: () => console.info('Kozmos just posted some updates to server'),
  onReceiveUpdates: () => console.info('Kozmos just received some updates from server')
  onError: (error, action) => console.info('Failed during %s: %s', error.action, error)
})
```

Add a page to likes:

```js

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
