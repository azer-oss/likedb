const LikeDB = require("../")
const test = require("prova")
const fixtures = require("./fixtures")

test("creating a new bookmark", async t => {
  const db = new LikeDB({ testing: true })

  await db.add({ url: "https://foobar.com", title: "Foo Bar" })

  const rec = await db.get("https://foobar.com")

  t.equal(rec.title, "Foo Bar")
  t.equal(rec.url, "https://foobar.com")
  t.equal(rec.cleanUrl, "foobar.com")
  t.equal(rec.cleanTitle, "foo bar")
  t.equal(rec.createdAt, rec.updatedAt)

  db.deleteDB()

  t.end()
})

test("updating title", async t => {
  const db = new LikeDB({ testing: true })

  await db.add({ url: "https://foobar.com", title: "Foo Bar" })

  await db.updateTitle("https://foobar.com", "oO Oo")

  const rec = await db.get("https://foobar.com")

  t.equal(rec.title, "oO Oo")
  t.equal(rec.url, "https://foobar.com")
  t.equal(rec.cleanUrl, "foobar.com")
  t.equal(rec.cleanTitle, "oo oo")
  t.ok(rec.createdAt < rec.updatedAt)

  db.deleteDB()

  t.end()
})

test("tagging", async t => {
  const db = new LikeDB({ testing: true })

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

  db.deleteDB()

  t.end()
})

test("deleting", async t => {
  const db = new LikeDB({ testing: true })
  await db.add({ url: "https://foobar.com", title: "Foo Bar" })

  let rec = await db.get("https://foobar.com")
  t.ok(rec)

  db.delete("https://foobar.com")

  rec = await db.get("https://foobar.com")
  t.notOk(rec)

  db.deleteDB()

  t.end()
})

test("recent", async t => {
  const db = new LikeDB({ testing: true })
  fixtures.forEach(async row => {
    await db.add(row)
  })

  const recent = await db.recent()
  t.equal(recent.length, 4)
  t.equal(recent[0].title, "How To Parent Like a German | Time")
  t.equal(recent[1].title, "Pieter Bruegel the Elder - Wikipedia")
  t.equal(recent[2].title, "Shahnameh - Wikipedia")
  t.equal(recent[3].title, "HOW TO MAKE A BABY LAUGH! - YouTube")

  db.deleteDB()

  t.end()
})

test("listByTag", async t => {
  const db = new LikeDB({ testing: true })
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

  db.deleteDB()

  t.end()
})

test("searchByTitle", async t => {
  const db = new LikeDB({ testing: true })
  fixtures.forEach(async row => {
    await db.add(row)
  })

  const howto = await db.searchByTitle("how to")

  t.equal(howto.length, 2)
  t.equal(howto[0].title, "How To Parent Like a German | Time")
  t.equal(howto[1].title, "HOW TO MAKE A BABY LAUGH! - YouTube")

  db.deleteDB()

  t.end()
})

test("searchByUrl", async t => {
  const db = new LikeDB({ testing: true })
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

  db.deleteDB()

  t.end()
})

test("searchByTags", async t => {
  const db = new LikeDB({ testing: true })
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

  db.deleteDB()

  t.end()
})
