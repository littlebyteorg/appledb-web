<template>
  <template v-if="infoArr.length > 0">
    <h2>{{ infoHead }}</h2>
    <ul style="padding-left: 0; list-style-type: none;">
      <li v-for="i in infoArr" :key="i">{{ i }}</li>
    </ul>
  </template>
  <h2 v-if="Object.keys(deviceObj).length > 0">{{ devicesHead }}</h2>
  <ul>
    <li v-for="d in deviceObj" :key="d" class="showOnHover">
      <router-link :to="d.url">{{ d.name }}</router-link> <code v-if="d.name != d.identifier" class="hoverElement">{{ d.identifier }}</code>
    </li>
  </ul>

    <p>AppleDB is not affiliated with Apple Inc.</p>
</template>

<script>
import { usePageFrontmatter } from '@vuepress/client'

String.prototype.format = function(vars) {
  let temp = this;
  for (let item in vars)
    temp = temp.replace("${" + item + "}", vars[item]);
  return temp
}

export default {
  data() {
    return {
      infoHead: "Info",
      versionStr: "Version: ${version}",
      buildStr: "Build: ${build}",
      releasedStr: "Released: ${released}",
      infoArr: [],

      devicesHead: "Devices",
      deviceObj: {},

      frontmatter: usePageFrontmatter(),
      query: this.$route.query,
    }
  },
  methods: {
    getQuery() {
      const query = this.query
      const iosList = this.frontmatter.iosList
      if (!query.hasOwnProperty('os') && !query.hasOwnProperty('build')) return false

      const osStr = query.os
      const build = query.build

      const ver = iosList.filter(x => x.osStr == osStr && x.uniqueBuild == build)[0]
      if (ver) return ver

      return false
    }
  },
  mounted() {
    const versionObject = this.getQuery()
    if (versionObject) {
      const title = `${versionObject.osStr} ${versionObject.version} (${versionObject.build})`
      document.title = `${title} | AppleDB`
      document.getElementById("pageTitle").innerHTML = title

      let rel = false
      if (versionObject.released) {
        const releasedArr = versionObject.released.split('-')
        const dateStyleArr = [{ year: 'numeric'}, { dateStyle: 'medium'}, { dateStyle: 'medium'}]
        const releaseDate = new Intl.DateTimeFormat('en-US', dateStyleArr[releasedArr.length-1]).format(new Date(versionObject.released))
        rel = this.releasedStr.format({ released: releaseDate })
      }

      this.infoArr = [
        this.versionStr.format({ version: [versionObject.osStr,versionObject.version].join(' ') }),
        this.buildStr.format({ build: versionObject.build }),
        rel
      ].filter(x => x)

      let deviceObj = { ...versionObject.deviceMap }
      let deviceMap = Object.keys(deviceObj).map(x => deviceObj[x])

      for (let device of deviceMap) {
        const group = device.group
        if (!group) continue
        const identArr = group.key

        let pass = true
        if (identArr.length > 1) for (const ident of identArr) if (!Object.keys(deviceObj).includes(ident)) {
          pass = false
          break
        }

        if (!pass) continue
        
        device.name = group.name
        device.key = group.name
        device.children = group.key.map(x => {
          let obj = { ...deviceObj[x] }
          delete obj.group
          return obj
        })
        device.url = `/device/${group.name.replace(/ /g,'-')}`
      }

      deviceMap = deviceMap.filter((value, index, self) =>
          index === self.findIndex((d) => (
              d.name === value.name &&
              d.url === value.url
          ))
      )

      this.deviceObj = deviceMap
    }
  }
}
</script>

<style>
.chevronPoint { 
  float: left;
  margin-left: -1.5em;
}

.chevron {
  padding-right: 0.23em;
  margin-top: 0.8em;
  font-size: 0.7em;
}

.showOnHover .hoverElement {
  opacity: 0;
  display: none !important;
}

.displayNone {
  display: none !important;
}

.showOnHover:hover .hoverElement {
  opacity: 1 !important;
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 100ms;
  display: inline !important;
}

.hoverElement:hover {
  opacity: 1 !important;
  display: inline !important;
}

input[type=checkbox]{
  position: absolute;
  left: -9999px;
  opacity: 0;
}

.clickToShow { display: none !important; }
.clickToHide { display: block !important; }
.clickToHideInline { display: inline !important; }
input:checked ~ .clickToHide { display: none !important; }
input:checked ~ .clickToShow { display: block !important; }
input:checked ~ .clickToShowInline { display: inline !important; }
</style>
