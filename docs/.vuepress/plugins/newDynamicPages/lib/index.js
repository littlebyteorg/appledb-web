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

var pageList = [
  ...require('./devicePages'),
  ...require('./firmwarePages'),
  ...require('./jailbreakPages'),
  ...require('./deviceListPages')
]

const latestVersions = require('./latestVersions')
const deviceTypeGroups = require('../../../../../appledb/appledb-web/deviceTypeGroups.json')

module.exports = function() {
  return {
    name: 'vuepress-new-dynamic-pages',
    async onInitialized(app) {
      for (const p of pageList) app.pages.push(await createPage(app, p))
    },
    onPrepared: async (app) => {
      await app.writeTemp('main.js', `export default ${JSON.stringify(bigJson)}`)
      await app.writeTemp('latestVersion.js', `export default ${JSON.stringify(latestVersions)}`)
      await app.writeTemp('deviceTypeGroups.js', `export default ${JSON.stringify(deviceTypeGroups)}`)
    }
  }
}