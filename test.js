let { test } = require('ava')

// https://github.com/delaballe/node-sqlcipher#usage
// https://coolaj86.com/articles/building-sqlcipher-for-node-js-on-raspberry-pi-2/
// https://www.zetetic.net/sqlcipher/sqlcipher-api/
let sqlite3 = require('./').verbose()
let dbFile = __dirname + '/test.db'

test.serial.cb('encrypt with key/cipher', t => {
  let db = new sqlite3.Database(dbFile)

  db.serialize(() => {
    db.run("PRAGMA KEY = 'secret'")
    db.run("PRAGMA CIPHER = 'aes-256-cbc'")

    db.run("DROP TABLE IF EXISTS lorem")
    db.run("CREATE TABLE lorem (info TEXT)")

    let stmt = db.prepare("INSERT INTO lorem VALUES (?)")
    let total = 10
    for (let i = 0; i < total; i++) {
      stmt.run("Ipsum " + i)
    }
    stmt.finalize()

    let count = 0
    db.each("SELECT rowid AS id, info FROM lorem", (err, row) => {
      if (err) return t.end(err)
      count++
      console.log(row.id + ": " + row.info)
    })

    db.close(() => {
      t.is(count, total)
      t.end()
    })
  })
})

test.serial.cb('decrypt with correct key/cipher', t => {
  let db = new sqlite3.Database(dbFile)

  db.serialize(() => {
    db.run("PRAGMA KEY = 'secret'")
    db.run("PRAGMA CIPHER = 'aes-256-cbc'")

    let total = 10
    let count = 0
    db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
      if (err) return t.end(err)
      count++
      console.log(row.id + ": " + row.info)
    })

    db.close(() => {
      t.is(count, total)
      t.end()
    })
  })
})

test.serial.cb('decrypt with wrong key', t => {
  let db = new sqlite3.Database(dbFile)

  db.serialize(() => {
    db.run("PRAGMA KEY = 'sec321ret'")
    db.run("PRAGMA CIPHER = 'aes-256-cbc'")

    t.plan(1)
    db.each("SELECT rowid AS id, info FROM lorem", function(err) {
      // [Error: SQLITE_NOTADB: file is encrypted or is not a database]
      t.regex(err.message, /file is encrypted/)
    })

    db.close(() => {
      t.end()
    })
  })
})

test.serial.cb('decrypt with wrong cipher', t => {
  let db = new sqlite3.Database(dbFile)

  db.serialize(() => {
    db.run("PRAGMA KEY = 'secret'")
    db.run("PRAGMA CIPHER = 'aes-128-cbc'")

    t.plan(1)
    db.each("SELECT rowid AS id, info FROM lorem", function(err) {
      // [Error: SQLITE_NOTADB: file is encrypted or is not a database]
      t.regex(err.message, /file is encrypted/)
    })

    db.close(() => {
      t.end()
    })
  })
})

// https://github.com/fritx/cross-sqlcipher/issues/4
// https://github.com/mapbox/node-sqlite3/issues/622#issuecomment-212518985
test.serial.cb('has lastID', t => {
  let db = new sqlite3.Database(dbFile)
  t.plan(2)

  db.serialize(() => {
    db.run("PRAGMA KEY = 'secret'")
    db.run("PRAGMA CIPHER = 'aes-256-cbc'")

    db.run('INSERT INTO lorem VALUES (?)', 'test-lastID-1', function (err) {
      if (err) return t.end(err)
      t.is(this.lastID, 11)
    })

    let stmt = db.prepare('INSERT INTO lorem VALUES (?)')
    stmt.run('test-lastID-2', err => {
      if (err) return t.end(err)
      t.is(stmt.lastID, 12)
    })
  })

  db.close(() => {
    t.end()
  })
})
