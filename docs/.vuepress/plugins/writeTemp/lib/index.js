const { createPage } = require('@vuepress/core')
const { path, fs } = require('@vuepress/utils')

const iosList = require('../../../../../grabData/ios')
const deviceList = require('../../../../../grabData/deviceList')
const deviceGroups = require('../../../../../grabData/deviceGroups')
const jbList = require('../../../../../grabData/jailbreak')
const bigJson = {
  ios: iosList,
  jailbreak: jbList,
  device: deviceList,
  groups: deviceGroups
}

const latestVersions = require('./latestVersions')
const latestDevices = require('./latestDevices')
const deviceTypeGroups = require('../../../../../appledb/appledb-web/deviceTypeGroups.json')

module.exports = function() {
  return {
    name: 'write-temp',
    onPrepared: async (app) => {
      await app.writeTemp('main.js', `export default ${JSON.stringify(bigJson)}`)
      await app.writeTemp('latestVersion.js', `export default ${JSON.stringify(latestVersions)}`)
      await app.writeTemp('latestDevices.js', `export default ${JSON.stringify(latestDevices)}`)
      await app.writeTemp('deviceTypeGroups.js', `export default ${JSON.stringify(deviceTypeGroups)}`)
    }
  }
}