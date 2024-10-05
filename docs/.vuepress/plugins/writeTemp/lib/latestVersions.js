const iosList = require('../../../../../grabData/ios')
.filter(x => !(x.version.includes('Simulator') || x.sdk || x.hideFromLatestVersions ))
const uniqueiOSList = iosList.filter((obj, index) => iosList.findIndex((item) => item.build === obj.build && item.osStr === obj.osStr) === index)
const latestVersionList = require('../../../../../appledb/appledb-web/homePage.json')

let latestVersionArr = latestVersionList['osVersionArray']

const latestVersions = latestVersionArr
.map(x => uniqueiOSList.filter(y => {
  const osStrCheck = y.osStr == x.osStr
  const betaRcCheck = (y.beta || y.rc) == x.beta
  
  const check = osStrCheck && betaRcCheck

  let startsWith = x.version
  if (startsWith && y.version) {
    startsWith = y.version.startsWith(startsWith)
    return check && startsWith
  }

  return check
})
.filter(x => x.released)
.sort((a,b) => {
  const date = [a,b].map(x => new Date(x.released))
  if (date[0] < date[1]) return 1
  if (date[0] > date[1]) return -1
  return 0
})[0])
.filter(x => x)
.map(x => {
  if (!x.released) return x
  if (x.released.includes(' ')) return x

  const dateOffset = (new Date().getTimezoneOffset() * 60 * 1000) + (60 * 60000)
  const currentDate = new Date(x.released).valueOf()
  const adjustedDate = new Date(currentDate + dateOffset)

  const releasedArr = x.released.split('-')
  const dateStyleArr = [{ year: 'numeric' }, { year: 'numeric', month: 'short' }, { dateStyle: 'medium' }]
  x.released =  new Intl.DateTimeFormat('en-US', dateStyleArr[releasedArr.length-1]).format(adjustedDate)
  x.releasedVal = adjustedDate.valueOf()

  return x
})

module.exports = latestVersions
