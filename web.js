const env = process.env.NODE_ENV || 'development'

if (env === 'development') {
  require('dotenv').config()
}

require('babel-polyfill')
require('babel-core/register')
require('./src/web')
