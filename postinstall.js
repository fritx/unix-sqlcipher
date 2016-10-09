// Building for sqlcipher
// https://github.com/mapbox/node-sqlite3#building-for-sqlcipher
'use strict'
require('shelljs/global')
var isArray = require('util').isArray

var args
try {
  args = JSON.parse(process.env.npm_config_argv).original
} finally {
  if (!isArray(args)) {
    args = []
  }
}
var targetArgs = args.filter(function (arg) {
  return /^--(runtime|target)/.test(arg)
})
var targetStr = targetArgs.reduce(function (m, arg) {
  return m + ' ' + arg
}, '')

// not windows
if (process.platform === 'darwin') {
  // macos
  if (exec('which brew').stdout.trim() === '') {
    throw new Error('`brew` is required to be installed.')
  }
  if (exec('brew list sqlcipher').code !== 0) {
    // exec('brew install sqlcipher')
    exec('brew install sqlcipher --with-fts')
  }
  exec('export LDFLAGS="-L`brew --prefix`/opt/sqlcipher/lib"')
  exec('export CPPFLAGS="-I`brew --prefix`/opt/sqlcipher/include"')
  exec('npm install sqlite3 --build-from-source --sqlite_libname=sqlcipher --sqlite=`brew --prefix`' + targetStr)
} else {
  // linux
  exec('export LDFLAGS="-L/usr/local/lib"')
  exec('export CPPFLAGS="-I/usr/local/include -I/usr/local/include/sqlcipher"')
  exec('export CXXFLAGS="$CPPFLAGS"')
  exec('npm install sqlite3 --build-from-source --sqlite_libname=sqlcipher --sqlite=/usr/local --verbose' + targetStr)
}
