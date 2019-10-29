const LikeDB = require("../dist").default
const resetStorage = require("../dist/storage").reset
const test = require("prova")
const fixtures = require("./fixtures")

test("creating a new bookmark", async t => {
  const db = createDB()

  await db.add({ url: "https://foobar.com", title: "Foo Bar" })

  const rec = await db.get("https://foobar.com")

  t.equal(rec.title, "Foo Bar")
  t.equal(rec.url, "https://foobar.com")
  t.equal(rec.cleanUrl, "foobar.com")
  t.equal(rec.cleanTitle, "foo bar")
  t.equal(rec.createdAt, rec.updatedAt)

  await purgeDB(db)

  t.end()
})

test("updating title", async t => {
  const db = createDB()

  await db.add({ url: "https://foobar.com", title: "Foo Bar" })

  await db.updateTitle("https://foobar.com", "oO Oo")

  const rec = await db.get("https://foobar.com")

  t.equal(rec.title, "oO Oo")
  t.equal(rec.url, "https://foobar.com")
  t.equal(rec.cleanUrl, "foobar.com")
  t.equal(rec.cleanTitle, "oo oo")
  t.ok(rec.createdAt < rec.updatedAt)

  await purgeDB(db)

  t.end()
})

test("tagging", async t => {
  const db = createDB()

  await db.add({ url: "https://foobar.com", title: "Foo Bar", tags: ["foo"] })
  await db.tag("https://foobar.com", "bar")
  await db.tag("https://foobar.com", "qux")

  let rec = await db.get("https://foobar.com")
  t.deepEqual(rec.tags, ["foo", "bar", "qux"])
  t.ok(rec.createdAt < rec.updatedAt)

  await db.untag("https://foobar.com", "bar")

  rec = await db.get("https://foobar.com")
  t.deepEqual(rec.tags, ["foo", "qux"])
  t.ok(rec.createdAt < rec.updatedAt)

  await purgeDB(db)

  t.end()
})

test("collections", async t => {
  const db = createDB()

  await db.createCollection({ title: "belgium", desc: "yolo" })
  await db.createCollection({ title: "berlin", desc: "hello world" })
  await db.createCollection({ title: "amsterdam", desc: "foobar" })
  await db.createCollection({ title: "new << >> york", desc: "qux" })

  const collections = await db.listCollections()
  t.equal(collections.length, 4)
  t.equal(collections[3].title, "belgium")
  t.equal(collections[2].title, "berlin")
  t.equal(collections[1].title, "amsterdam")
  t.equal(collections[0].title, "new << >> york")

  let rec = await db.getCollection("berlin")
  t.equal(rec.title, "berlin")
  t.equal(rec.desc, "hello world")
  t.ok(rec.createdAt > Date.now() - 1000)
  t.ok(rec.updatedAt > Date.now() - 1000)

  let search = await db.searchCollections("BE")
  t.equal(search.length, 2)
  t.equal(search[0].title, "berlin")
  t.equal(search[1].title, "belgium")

  search = await db.searchCollections("New ")
  t.equal(search.length, 1)
  t.equal(search[0].title, "new << >> york")
  t.equal(search[0].normalizedTitle, "new york")

  await purgeDB(db)

  t.end()
})

test("collections/links", async t => {
  const db = createDB()

  await db.createCollection({ title: "london", desc: "hello world" })
  await db.createCollection({ title: "berlin", desc: "hello world" })
  await db.createCollection({ title: "madrid", desc: "hello world" })

  await db.addToCollection({
    collection: "berlin",
    url: "https://foobar.com"
  })

  await db.addToCollection({
    collection: "berlin",
    url: "https://span.com"
  })

  await db.addToCollection({
    collection: "berlin",
    url: "https://eggs.com"
  })

  let links = await db.listByCollection("berlin")

  t.equal(links.length, 3)
  t.equal(links[2].url, "https://foobar.com")
  t.equal(links[1].url, "https://span.com")
  t.equal(links[0].url, "https://eggs.com")

  let colls = await db.getCollectionsOfUrl("https://span.com")
  t.equal(colls.length, 1)
  t.equal(colls[0].title, "berlin")

  let recentColls = await db.getRecentCollections()
  t.equal(recentColls.length, 3)
  t.equal(recentColls[0].title, "berlin")
  t.equal(recentColls[1].title, "madrid")
  t.equal(recentColls[2].title, "london")

  await db.removeFromCollection("https://span.com", "berlin")
  colls = await db.getCollectionsOfUrl("https://span.com", "berlin")
  t.equal(colls.length, 0)

  await purgeDB(db)
  t.end()
})

test("deleting", async t => {
  const db = createDB()
  await db.add({ url: "https://foobar.com", title: "Foo Bar" })

  let rec = await db.get("https://foobar.com")
  t.ok(rec)

  db.delete("https://foobar.com")

  rec = await db.get("https://foobar.com")
  t.notOk(rec)

  await purgeDB(db)

  t.end()
})

test("recent", async t => {
  const db = createDB()
  fixtures.forEach(async row => {
    await db.add(row)
  })

  const recent = await db.recent()
  t.equal(recent.length, 4)
  t.equal(recent[0].title, "How To Parent Like a German | Time")
  t.equal(recent[1].title, "Pieter Bruegel the Elder - Wikipedia")
  t.equal(recent[2].title, "Shahnameh - Wikipedia")
  t.equal(recent[3].title, "HOW TO MAKE A BABY LAUGH! - YouTube")

  await purgeDB(db)

  t.end()
})

test("listByTag", async t => {
  const db = createDB()
  fixtures.forEach(async row => {
    await db.add(row)
  })

  const art = await db.listByTag("art")
  t.equal(art.length, 2)
  t.equal(art[0].title, "Pieter Bruegel the Elder - Wikipedia")
  t.equal(art[1].title, "Shahnameh - Wikipedia")

  const parenting = await db.listByTag("parenting")
  t.equal(parenting.length, 2)
  t.equal(parenting[0].title, "How To Parent Like a German | Time")
  t.equal(parenting[1].title, "HOW TO MAKE A BABY LAUGH! - YouTube")

  await purgeDB(db)

  t.end()
})

test("searchByTitle", async t => {
  const db = createDB()
  fixtures.forEach(async row => {
    await db.add(row)
  })

  const howto = await db.searchByTitle("how to")

  t.equal(howto.length, 2)
  t.equal(howto[0].title, "How To Parent Like a German | Time")
  t.equal(howto[1].title, "HOW TO MAKE A BABY LAUGH! - YouTube")

  await purgeDB(db)

  t.end()
})

test("searchByUrl", async t => {
  const db = createDB()
  fixtures.forEach(async row => {
    await db.add(row)
  })

  const you = await db.searchByUrl("you")
  t.equal(you.length, 1)
  t.equal(you[0].title, "HOW TO MAKE A BABY LAUGH! - YouTube")

  const en = await db.searchByUrl("en.")
  t.equal(en.length, 2)
  t.equal(en[0].title, "Pieter Bruegel the Elder - Wikipedia")
  t.equal(en[1].title, "Shahnameh - Wikipedia")

  await purgeDB(db)

  t.end()
})

test("searchByTags", async t => {
  const db = createDB()
  fixtures.forEach(async row => {
    await db.add(row)
  })

  const art = await db.searchByTags("a")
  t.equal(art.length, 2)
  t.equal(art[0].title, "Pieter Bruegel the Elder - Wikipedia")
  t.equal(art[1].title, "Shahnameh - Wikipedia")

  const parenting = await db.searchByTags("par")
  t.equal(parenting.length, 2)
  t.equal(parenting[0].title, "How To Parent Like a German | Time")
  t.equal(parenting[1].title, "HOW TO MAKE A BABY LAUGH! - YouTube")

  await purgeDB(db)

  t.end()
})

test("speed dial", async t => {
  const db = createDB()

  await db.addSpeedDial({ key: "hn", url: "https://news.ycombinator.com" })
  await db.addSpeedDial({ key: "wiki", url: "https://en.wikipedia.org" })
  await db.addSpeedDial({ key: "go", url: "https://golang.org/doc/" })

  t.equal((await db.getSpeedDialByUrl("https://golang.org/doc/")).key, "go")
  t.equal(
    (await db.getSpeedDialByUrl("https://news.ycombinator.com")).key,
    "hn"
  )
  t.equal((await db.getSpeedDialByUrl("https://en.wikipedia.org")).key, "wiki")

  const speedDials = await db.listSpeedDials()
  t.equal(speedDials.length, 3)
  t.equal(speedDials[2].key, "hn")
  t.equal(speedDials[2].url, "https://news.ycombinator.com")
  t.equal(speedDials[1].key, "wiki")
  t.equal(speedDials[1].url, "https://en.wikipedia.org")
  t.equal(speedDials[0].key, "go")
  t.equal(speedDials[0].url, "https://golang.org/doc/")

  const hn = await db.getSpeedDialByKey("hn")
  t.equal(hn.key, "hn")
  t.equal(hn.url, "https://news.ycombinator.com")

  const searchResults = await db.searchSpeedDials("WI")
  t.equal(searchResults.length, 1)
  t.equal(searchResults[0].key, "wiki")
  t.equal(searchResults[0].url, "https://en.wikipedia.org")

  await db.updateSpeedDial({
    key: "hnews",
    url: "https://news.ycombinator.com"
  })

  const updatedSpeedDials = await db.listSpeedDials()

  t.equal(updatedSpeedDials.length, 3)
  t.equal(updatedSpeedDials[2].key, "hnews")
  t.equal(updatedSpeedDials[2].url, "https://news.ycombinator.com")

  await db.removeSpeedDial("hnews")

  const speedDialsAfterDelete = await db.listSpeedDials()

  t.equal(speedDialsAfterDelete.length, 2)
  t.equal(speedDialsAfterDelete[1].key, "wiki")
  t.equal(speedDialsAfterDelete[1].url, "https://en.wikipedia.org")
  t.equal(speedDialsAfterDelete[0].key, "go")
  t.equal(speedDialsAfterDelete[0].url, "https://golang.org/doc/")

  await purgeDB(db)
  t.end()
})

function createDB() {
  resetStorage()
  return new LikeDB({ testing: true })
}

function purgeDB(db) {
  return new Promise(resolve => {
    db.deleteDB()
    setTimeout(resolve, 10)
  })
}
