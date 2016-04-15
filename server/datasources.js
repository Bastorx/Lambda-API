'use strict';
var path = require('path');

module.exports = {
  "db": {
    "host": process.env.DB_HOST,
    "port": process.env.DB_PORT,
    "database":  process.env.DB_NAME,
    "user":  process.env.DB_USER,
    "password":  process.env.DB_PWD,
    "name": "db",
    "connector": "mongodb"
  },
  "files": {
   "name": "files",
   "connector": "loopback-component-storage",
    "provider": 'filesystem',
    "root": path.join(__dirname, '../client/pictures')
 }
}