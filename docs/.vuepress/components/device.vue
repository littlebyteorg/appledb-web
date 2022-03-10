<template>
  <template v-if="Object.keys(frontmatter.device).length != Object.keys(devices).length">
    <h2 v-html="infoHeader" v-if="infoData.length > 0"/>
    <p>
      <div v-for="(i, index) in infoData" :key="i">
        <template v-if="index == 'identifier' && deviceIdentifierArr.length > 5 && !showAllIdent">{{ i.replace(deviceIdentifierArr.join(', '), deviceIdentifierArr.slice(0, 3).join(', ')) }}, <a style="user-select: none; cursor: pointer;" v-on:click="showAllIdent = true">...</a></template>
        <template v-else-if="index == 'model' && deviceModelArr.length > 5 && !showAllModel">{{ i.replace(deviceModelArr.join(', '), deviceModelArr.slice(0, 3).join(', ')) }}, <a style="user-select: none; cursor: pointer;" v-on:click="showAllModel = true">...</a></template>
        <template v-else>{{ i }}</template>
      </div>
    </p>
    <h2 v-html="groupHeader" v-if="groupedDevices && groupedDevices.length > 0"/>
    <ul>
      <li v-for="d in groupedDevices" :key="d">
        <a v-html="d.name" :href="devicePath + d.identifier + '.html'"/>
      </li>
    </ul>
  </template>
  <h2 v-if="Object.keys(frontmatter.device).length != Object.keys(devices).length" v-html="tableHeader"/>
  <ul class="tableOptionsWrapper">
    <li>
      <div class="chartDropdown">
        <i class="fas fa-filter"></i>
        {{ filterStr }}
        <span class="arrow down"></span>
      </div>
      <div class="chartDropdownBox opaqueHover">
        <ul>
          <li class="dropdown-item">
            <input type="checkbox" v-model="simpleTable" id="simpleTableCheckbox">
            <label for="simpleTableCheckbox">{{ simpleTableStr }}</label>
          </li>
          <template v-if="!simpleTable">
            <!--<li class="dropdown-item">
              <input type="checkbox" v-model="showGuide" id="showGuideCheckbox">
              <label for="showGuideCheckbox">{{ showGuideStr }}</label>
            </li>-->
            <li class="dropdown-item" style="padding: 0px"><hr></li>
            <li class="dropdown-item">
              <input type="checkbox" v-model="showBuildNum" id="showBuildNumCheckbox">
              <label for="showBuildNumCheckbox">{{ showBuildNumStr }}</label>
            </li>
            <li class="dropdown-item">
              <input type="checkbox" v-model="showVersion" id="showVersionCheckbox">
              <label for="showVersionCheckbox">{{ showVersionStr }}</label>
            </li>
            <li class="dropdown-item">
              <input type="checkbox" v-model="showJailbreak" id="showJailbreakCheckbox">
              <label for="showJailbreakCheckbox">{{ showJailbreakStr }}</label>
            </li>
            <li class="dropdown-item">
              <input type="checkbox" v-model="showReleaseDate" id="showReleaseDateCheckbox">
              <label for="showReleaseDateCheckbox">{{ showReleaseDateStr }}</label>
            </li>
          </template>
          <li class="dropdown-item" style="padding: 0px"><hr></li>
          <li class="dropdown-item">
            <input type="checkbox" v-model="showBeta" id="showBetaCheckbox">
            <label for="showBetaCheckbox">{{ showBetaStr }}</label>
          </li>
          <li class="dropdown-item">
            <input type="checkbox" v-model="showStable" id="showStableCheckbox">
            <label for="showStableCheckbox">{{ showStableStr }}</label>
          </li>
          <template v-if="Object.keys(frontmatter.device).length == Object.keys(devices).length">
            <li class="dropdown-item">
              <input type="checkbox" v-model="showiOS" id="showiOSCheckbox">
              <label for="showiOSCheckbox">{{ showiOSStr }}</label>
            </li>
            <li class="dropdown-item">
              <input type="checkbox" v-model="showtvOS" id="showtvOSCheckbox">
              <label for="showtvOSCheckbox">{{ showtvOSStr }}</label>
            </li>
            <li class="dropdown-item">
              <input type="checkbox" v-model="showwatchOS" id="showwatchOSCheckbox">
              <label for="showwatchOSCheckbox">{{ showwatchOSStr }}</label>
            </li>
          </template>
        </ul>
      </div>
    </li>
    <li>
      <div class="chartDropdown" v-on:click="reverseSortingBtn()">
        <i class="fas fa-sort"></i>
          {{ sortStr }}
      </div>
    </li>
  </ul>
  <div class="tableContainer">
    <table>
      <tr v-if="fwArr.length">
        <template v-if="simpleTable">
          <th v-html="fromStr"/>
          <th v-html="toStr"/>
          <th v-html="jailbreakStr"/>
        </template>
        <template v-else>
          <th v-html="buildStr" v-if="showBuildNum"/>
          <th v-html="versionStr" v-if="showVersion"/>
          <th v-html="jailbreakStr" v-if="showJailbreak"/>
          <th v-html="releaseDateStr" v-if="showReleaseDate" style="width: 15%;"/>
        </template>
      </tr>
      <tr v-else><td>{{noFwStr}}</td></tr>
      <template v-for="(fw, index) in fwArr" :key="fw">
        <tr v-if="simpleTable">
          <td v-for="i in (reverseSorting) ? Object.keys(fw).reverse() : Object.keys(fw)" :key="i">{{ fw[i].version }}</td>
          <td v-if="fw.startBuild.jailbreakArr.length"><router-link :to="jailbreakPath + fw.startBuild.jailbreakArr[0].name.replace(/ /g, '-') + '.html'">{{ fw.startBuild.jailbreakArr[0].name }}</router-link></td>
          <td v-else v-html="noJbStr"/>
        </tr>
        <tr v-else>
          <td v-if="showBuildNum"><a :href="firmwarePath + fw.uniqueBuild + '.html'">{{fw.build}}</a></td>

          <template v-if="showVersion">
            <td v-if="!showBuildNum"><a :href="firmwarePath + fw.uniqueBuild + '.html'">{{fw.osStr}} {{fw.version}} <span v-if="fw.duplicateVersion">({{fw.build}})</span></a></td>
            <td v-else>{{fw.osStr}} {{fw.version}}</td>
          </template>
          
          <template v-if="showJailbreak">
            <td v-if="fw.jailbreakArr.length > 0"><span v-for="(jb, index) in fw.jailbreakArr" :key="jb"><a :href="jailbreakPath + jb.name.replace(/ /g, '-') + '.html'" v-html="jb.name"/><span v-if="index+1 < fw.jailbreakArr.length">, </span></span></td>
            <td v-else v-html="noJbStr"/>
          </template>
          
          <td v-if="showReleaseDate">{{fw.released}}</td>
        </tr>
        <tr v-if="index == entryCount - 1 && !simpleTable"><td :colspan="(simpleTable) ? 3 : (showBuildNum + showVersion + showJailbreak + showReleaseDate)">{{loadingStr}}</td></tr>
      </template>
    </table>
  </div>
</template>

<script>
import { usePageFrontmatter } from '@vuepress/client'
import json from '@temp/main'

String.prototype.format = function(vars) {
  let temp = this;
  for (let item in vars)
    temp = temp.replace("${" + item + "}", vars[item]);
  return temp
}

function removeNullAndDuplicatesAndSort(r) {
  r = r.filter(x => x)
  r = [...new Set(r)]
  r = r.sort((a,b) => a - b)
  return r
}

export default {
  data() {
    return {
      devicePath: '/device/',
      jailbreakPath: '/jailbreak/',
      firmwarePath: '/firmware/',
      timeLocale: 'en-US',

      infoHeader: 'Info',
      deviceStr: 'Device: ${dev}',
      identStr: 'Identifier: ${ident}',
      socStr: 'SoC: ${soc}',
      archStr: 'Arch: ${arch}',
      modelStr: 'Model: ${model}',

      relatedHeader: 'Related Devices',
      groupedHeader: 'Grouped Devices',

      tableHeader: 'Version Table',

      showBetaStr: 'Show beta versions',
      showStableStr: 'Show stable versions',
      showiOSStr: 'Show iOS versions',
      showtvOSStr: 'Show tvOS versions',
      showwatchOSStr: 'Show watchOS versions',

      showBuildNumStr: 'Show build numbers',
      showVersionStr: 'Show version numbers',
      showJailbreakStr: 'Show jailbreaks',
      showReleaseDateStr: 'Show release date',

      showGuideStr: 'Show guide links',
      simpleTableStr: 'Simple table',

      fromStr: 'From',
      toStr: 'To',
      buildStr: 'Build',
      versionStr: 'Version',
      jailbreakStr: 'Jailbreak',
      releaseDateStr: 'Released',
      noJbStr: 'N/A',

      filterStr: 'Filter',
      sortStr: 'Sort',
      loadingStr: 'Loading...',
      noFwStr: 'No software versions available.',

      showAllIdent: false,
      showAllModel: false,

      showBeta: false,
      showStable: true,
      showtvOS: true,
      showiOS: true,
      showwatchOS: true,

      showBuildNum: false,
      showVersion: true,
      showJailbreak: true,
      showReleaseDate: false,

      simpleTable: false,
      showGuide: false,

      reverseSorting: true,
      fwArr: [],

      constEntryCount: 50,
      constMaxEntryCount: 99999,
      entryIncrement: 50,

      entryCount: 50,
      maxEntryCount: 99999,

      frontmatter: usePageFrontmatter(),
      devices: json.device,
      firmwares: json.ios,
      jailbreaks: json.jailbreak,
    }
  },
  computed: {
    deviceNameStr() {
      const fm = this.frontmatter
      if (fm.name) return this.deviceStr.format({ dev: fm.name })

      var deviceList = fm.device
      if (!deviceList) return
      deviceList = deviceList.map(x => this.devices[x])

      const deviceNameArr = removeNullAndDuplicatesAndSort(deviceList.map(x => x.name))
      if (deviceNameArr.length > 0) return this.deviceStr.format({ dev: deviceNameArr.join(', ') })
    },
    deviceIdentifierArr() {
      const fm = this.frontmatter
      var deviceList = fm.device
      if (!deviceList) return
      deviceList = deviceList.map(x => this.devices[x])
      
      const deviceIdentifierArr = removeNullAndDuplicatesAndSort(deviceList.map(x => x.identifier))
      return deviceIdentifierArr
    },
    deviceIdentifierStr() {
      const arr = this.deviceIdentifierArr
      if (arr.length > 0) return this.identStr.format({ ident: arr.join(', ') })
    },
    deviceSocStr() {
      const fm = this.frontmatter
      var deviceList = fm.device
      if (!deviceList) return
      deviceList = deviceList.map(x => this.devices[x])
      
      const deviceSocArr = removeNullAndDuplicatesAndSort(deviceList.map(x => x.soc))
      if (deviceSocArr.length > 0) return this.socStr.format({ soc: deviceSocArr.join(', ')})
    },
    deviceArchStr() {
      const fm = this.frontmatter
      var deviceList = fm.device
      if (!deviceList) return
      deviceList = deviceList.map(x => this.devices[x])
      
      const deviceArchArr = removeNullAndDuplicatesAndSort(deviceList.map(x => x.arch))
      if (deviceArchArr.length > 0) return this.archStr.format({ arch: deviceArchArr.join(', ')})
    },
    deviceModelArr() {
      const fm = this.frontmatter
      var deviceList = fm.device
      if (!deviceList) return
      deviceList = deviceList.map(x => this.devices[x])
      
      const deviceModelArr = removeNullAndDuplicatesAndSort(deviceList.map(function(x) {
        if (x.model) return x.model.join(', ')
        else return null
      }))

      var retArr = []
      for (var i of deviceModelArr) retArr.push(...i.split(', '))

      retArr = removeNullAndDuplicatesAndSort(retArr)

      return retArr
    },
    deviceModelStr() {
      const arr = this.deviceModelArr
      if (arr.length > 0) return this.modelStr.format({ model: arr.join(', ') })
    },
    infoData() {
      const fm = this.frontmatter
      if (!fm.device && !fm.group) return []
      return {
        device: this.deviceNameStr,
        identifier: this.deviceIdentifierStr,
        soc: this.deviceSocStr,
        arch: this.deviceArchStr,
        model: this.deviceModelStr
      }
    },
    groupHeader() {
      const fm = this.frontmatter
      if (fm.device.length == 1) return this.relatedHeader
      else return this.groupedHeader
    },
    groupedDevices() {
      const fm = this.frontmatter
      var group = []
      if (fm.device.length < 1) return
      else if (fm.device.length == 1) group = json.groups.filter(x => x.devices.includes(fm.device[0]))[0]
      else group = { "devices": [...fm.device] }

      // Check if group is valid
      if (!group) return
      if (!group.hasOwnProperty('devices')) return

      var devArr = group.devices
      if (devArr.length < 1) return
      // Remove current device from related devices
      if (fm.device.length == 1) devArr = devArr.filter(x => x != fm.device[0])
      // Grab device data
      devArr = devArr.map(d => this.devices[d])
      return devArr
    }
  },
  methods: {
    reverseSortingBtn: function() {
      this.reverseSorting = !this.reverseSorting
    },
    getFwArrMethod: function(val) {
      const fm = this.frontmatter
      var devArr = fm.device

      var fwArr = []
      if (devArr.length == Object.keys(this.devices).length) fwArr = this.firmwares
      else {
        for (var d in devArr) {
          var devFwArr = this.firmwares.filter(function(x) {
            if (!x.hasOwnProperty('devices')) return 0
            else return Object.keys(x.devices).includes(devArr[d])
          })
          devFwArr.map(function(x) { if (!fwArr.includes(x)) fwArr.push(x) })
        }
      }

      fwArr = fwArr.filter(fw => (
        (
          (fw.istvOS && this.showtvOS) ||
          (fw.isiOS && this.showiOS) ||
          (fw.iswatchOS && this.showwatchOS) ||
          !(fw.istvOS || fw.isiOS || fw.iswatchOS)
        ) && (
          (fw.beta && this.showBeta) ||
          (!fw.beta && this.showStable)
        )
      ))

      if (this.reverseSorting) fwArr = fwArr.reverse()

      if (!this.simpleTable) {
        var filterVal = this.entryCount - this.entryIncrement
        fwArr = fwArr.filter((fw,index) => index < val)
          .filter((fw, index) => index >= filterVal)
      }

      var fwArrLength = this.fwArr.concat(fwArr).length
      if (fwArrLength <= this.entryCount) this.maxEntryCount = fwArrLength

      var jbList = this.jailbreaks
      for (var f in fwArr) {
        var jbArr = []
        const fw = fwArr[f]
        for (var jb in jbList) {
          if (!jbList[jb].hasOwnProperty('compatibility')) continue
          for (var c in jbList[jb].compatibility) {
            if (!jbList[jb].compatibility[c].firmwares.includes(fw.uniqueBuild)) continue
            if (!jbList[jb].compatibility[c].devices.some(r=> devArr.includes(r))) continue
            if (jbArr.includes(jbList[jb])) continue
            jbArr.push(jbList[jb])
          }
        }

        jbArr = jbArr.sort((a,b) => a.priority - b.priority)
        if (this.simpleTable) jbArr = jbArr.filter((jb, index) => index == 0)
        
        fwArr[f].jailbreakArr = jbArr
      }

      const timeLocale = this.timeLocale
      fwArr = fwArr.map(function(x) {
        if (!x.hasOwnProperty('released')) return x
        x.released = new Intl.DateTimeFormat(timeLocale, { dateStyle: 'medium'}).format(new Date(x.released))
        return x
      })

      if (this.simpleTable) {
        var newArr = []
        fwArr.map(function(fw, index) {
          var newObj = {}
          if (index == 0 || JSON.stringify(newArr[newArr.length-1].endBuild.jailbreakArr) != JSON.stringify(fw.jailbreakArr)) {
            newObj.startBuild = fw
            newObj.endBuild = fw
            newArr.push(newObj)
          } else {
            newArr[newArr.length-1].endBuild = fw
          }
        })
        fwArr = newArr

        return fwArr
      }

      return this.fwArr.concat(fwArr)
    },
    loadMoreRows: function() {
      window.onscroll = () => {
        let bottomOfWindow = document.documentElement.scrollTop + window.innerHeight > document.documentElement.offsetHeight * 0.9
        if (bottomOfWindow && !this.simpleTable) {
          if (this.entryCount + this.entryIncrement >= this.maxEntryCount) this.entryCount = this.maxEntryCount
          this.entryCount += this.entryIncrement
        }
      }
    },
    resetFwArr: function() {
      this.fwArr = []
      this.maxEntryCount = this.constMaxEntryCount
      this.fwArr = this.getFwArrMethod(this.constEntryCount)
      this.entryCount = this.constEntryCount
    }
  },
  watch: {
    reverseSorting: function () {
      this.resetFwArr()
    },
    showBeta: function (bool) {
      this.resetFwArr()
    },
    showStable: function (bool) {
      this.resetFwArr()
    },
    showtvOS: function (bool) {
      if (this.simpleTable && bool) {
        this.showiOS = false
        this.showwatchOS = false
      }
      this.resetFwArr()
    },
    showiOS: function (bool) {
      if (this.simpleTable && bool) {
        this.showtvOS = false
        this.showwatchOS = false
      }
      this.resetFwArr()
    },
    showwatchOS: function (bool) {
      if (this.simpleTable && bool) {
        this.showiOS = false
        this.showtvOS = false
      }
      this.resetFwArr()
    },
    showGuide: function (bool) {
      this.resetFwArr()
    },
    simpleTable: function (bool) {
      var enableArr = ['showiOS', 'showtvOS', 'showwatchOS']
      var enabledCount = enableArr.map(x => this[x]).filter(x => x).length
      if (bool && enabledCount > 1 && Object.keys(this.frontmatter.device).length == Object.keys(this.devices).length) {
        for (var i in enableArr) {
          if (this[enableArr[i]]) {
            for (var j of enableArr) this[j] = false
            this[enableArr[i]] = true
            break
          }
        }
        enabledCount = enableArr.map(x => this[x]).filter(x => x).length
        if (enabledCount == 0) this[enableArr[0]] = true
      }
      this.resetFwArr()
    },
    entryCount: function(val) {
      this.fwArr = this.getFwArrMethod(val)
    }
  },
  created() {
    this.resetFwArr()
  },
  mounted() {
    this.loadMoreRows()
    if (window.screen.width > 650) this.showReleaseDate = true
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

.showOnHover:hover .hoverElement {
  opacity: 0.3;
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 100ms;
  display: inline !important;
}

.showOnHover:hover .opaqueHover {
  opacity: 1 !important;
}

.hoverElement:hover {
  opacity: 1 !important;
  display: inline !important;
}

.chartDropdown {
  font-size: 0.9rem;
  line-height: 1.4rem;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
}

.chartDropdownBox {
  position: absolute;
  height: auto !important;
  box-sizing: border-box;
  background-color: var(--c-bg-navbar);
  border-bottom-color: var(--c-border-dark);
  text-align: left;
  border-radius: 0.25rem;
  white-space: nowrap;
  top: auto;
  user-select: none;
  border: 0px solid var(--c-border);

  padding: 0;
  max-height: 0px;
  transition: 300ms ease-in-out;
}

.chartDropdownBox input[type="checkbox"] {
  position: static;
  left: 0px;
  opacity: 1;
  margin-right: .5em;
}

.chartDropdown:hover + div.chartDropdownBox {
  left: auto;
  top: auto;
  padding: 1.5em 0.8em 1.5em 0em;
  border: 1px solid var(--c-border);
  max-height: 100%;
  transition: 300ms ease-in-out;
}

.chartDropdownBox:hover {
  left: auto;
  top: auto;
  padding: 1.5em 0.8em 1.5em 0em;
  border: 1px solid var(--c-border);
  max-height: 100%;
  transition: 300ms ease-in-out;
}

.chartDropdown:hover + div.chartDropdownBox li {
  opacity: 1;
  padding: 0em 1em;
  max-height: 100%;
}

.chartDropdownBox:hover li {
  opacity: 1;
  padding: 0em 1em;
  max-height: 100%;
}

.chartDropdownBox li {
  list-style-type: none;
  float: none !important;
  margin: 0 !important;

  overflow: hidden;
  padding: 0px;
  opacity: 0;
  max-height: 0px;
  transition: 300ms ease-in-out;
}

.tableOptionsWrapper li {
  float: left;
  margin: 0.2em 1.3em 1em 0em;
}

.tableOptionsWrapper li {
  list-style-type: none;
}

.chartDropdown button {
  cursor: pointer;
  border: none;
  background-color: inherit;
  font-size: inherit;
  line-height: inherit;
  font-weight: inherit;
  font-family: inherit;
  color: inherit;
  padding: inherit;
}
</style>