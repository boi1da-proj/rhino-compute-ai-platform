/* Lightweight observability helper for appserver */
const fs = require('fs')
const path = require('path')
const LOG_PATH = process.env.OBS_LOG_PATH || path.join(__dirname, 'observability.log')

module.exports = {
  logEvent: (evt, data) => {
    const payload = { t: Date.now(), evt, data }
    try { fs.appendFileSync(LOG_PATH, JSON.stringify(payload) + "\n") } catch (err) { /* ignore */ }
  }
}
