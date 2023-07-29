const latestVersions = require('./latestVersions')
const latestDevices = require('./latestDevices')
const deviceTypeGroups = require('../../../../../appledb/appledb-web/deviceTypeGroups.json')

module.exports = function() {
  return {
    name: 'write-temp',
    onPrepared: async (app) => {
      await app.writeTemp('latestVersion.js', `export default ${JSON.stringify(latestVersions)}`)
      await app.writeTemp('latestDevices.js', `export default ${JSON.stringify(latestDevices)}`)
      await app.writeTemp('deviceTypeGroups.js', `export default ${JSON.stringify(deviceTypeGroups)}`)
    }
  }
}