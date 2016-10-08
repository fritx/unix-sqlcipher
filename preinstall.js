// Building for sqlcipher
// https://github.com/mapbox/node-sqlite3#building-for-sqlcipher
'use strict'
require('shelljs/global')

if (process.platform === 'win32') {
  // windows
  throw new Error('`win32` is not supported. Perhaps you should look for `cross-sqlcipher`.')
}
