'use strict'

module.exports = {
  NODE_ENV: '"production"',
  FIREBASE_API_KEY: "'" + process.env.npm_config_FIREBASE_API_KEY + "'",
  FIREBASE_AUTH_DOMAIN: "'" + process.env.npm_config_FIREBASE_AUTH_DOMAIN + "'",
  FIREBASE_DATABASE_URL: "'" + process.env.npm_config_FIREBASE_DATABASE_URL + "'",
  FIREBASE_PROJECT_ID: "'" + process.env.npm_config_FIREBASE_PROJECT_ID + "'",
  FIREBASE_STORAGE_BUCKET: "'" + process.env.npm_config_FIREBASE_STORAGE_BUCKET + "'",
  FIREBASE_MESSAGING_SENDER_ID: "'" + process.env.npm_config_FIREBASE_MESSAGING_SENDER_ID + "'"
}