# unix-sqlcipher

> Encrypted sqlite3 for MacOS and Linux
> See also: [cross-sqlcipher](https://github.com/fritx/cross-sqlcipher)

```sh
npm install unix-sqlcipher
```

```js
var sqlite3 = require('unix-sqlcipher').verbose();
var db = new sqlite3.Database('test.db');

db.serialize(function() {
  db.run("PRAGMA KEY = 'secret'");
  db.run("PRAGMA CIPHER = 'aes-128-cbc'");

  db.run("CREATE TABLE lorem (info TEXT)");

  var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
  for (var i = 0; i < 10; i++) {
      stmt.run("Ipsum " + i);
  }
  stmt.finalize();

  db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
      console.log(row.id + ": " + row.info);
  });
});

db.close();
```

## Credits

- https://github.com/mapbox/node-sqlite3#building-for-sqlcipher
- https://coolaj86.com/articles/building-sqlcipher-for-node-js-on-raspberry-pi-2/
- https://github.com/delaballe/node-sqlcipher#usage
