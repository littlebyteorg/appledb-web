const deviceObj = require('../../../../../grabData/deviceList')
const deviceList = require('../../../../../grabData/deviceGroups')
.filter(x => x.released)
.sort((a,b) => {
  const r = [a,b].map(x => {
    if (!Array.isArray(x.released)) return x.released
    else return x.released.sort((a,b) => sortDate(a,b))[0]
  })
  
  return sortDate(r[0], r[1])
})
.slice(0,10)
.map(x => {
  x.devices = x.devices.map(x => deviceObj[x])
  if (x.devices[0].imgCount > 0) x.imgKey = x.devices[0].key
  else x.imgKey = 'logo'

  return x
})

function sortDate(a,b) {
  const r = [a,b].map(x => new Date(x))
  if (r[0] < r[1]) return 1
  if (r[0] > r[1]) return -1
  return 0
}

module.exports = deviceList