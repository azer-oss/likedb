const test = require("prova")
const Scheduler = require("../lib/scheduler")

test('makes the first call immediately', t => {
  t.plan(1)

  const start = Date.now()

  var s = new Scheduler({
    fn: () => {
      t.ok(Date.now() - start < 100)
    }
  })

  s.schedule()
})

test('later calls will be delayed in intervals', t => {
  t.plan(8)

  let start = Date.now()
  let counter = 0

  var s = new Scheduler({
    interval: 0.250,
    fn: () => {
      counter++

      t.ok(counter < 4)

      if (counter == 1) {
        t.ok(Date.now() - start < 100)
      } else {
        t.ok(Date.now() - start > 240)
        t.ok(Date.now() - start < 260)
      }

      start = Date.now()
      if (counter < 3) s.schedule()
    }
  })

  s.schedule()
})

test('aborting', t => {
  t.plan(1)

  const start = Date.now()

  var s = new Scheduler({
    interval: 0.1,
    fn: () => {
      t.ok(Date.now() - start < 100)

      s.schedule()
      setTimeout(() => s.abort(), 25)
    }
  })

  s.schedule()
})
