<template>
  <template v-if="!frontmatter.mainList">
    <h2 v-html="infoHeader" v-if="infoData.length > 0"></h2>
    <p class="flexWrapper" :style="(wrapImg) ? 'flex-direction: column;' : 'flex-direction: row;'">
      <div id="flexInfo">
        <div v-for="(i, index) in infoData" :key="i">
          <template v-if="index == 'identifier' && deviceIdentifierArr.length > 5 && !showAllIdent">{{ i.replace(deviceIdentifierArr.join(', '), deviceIdentifierArr.slice(0, 3).join(', ')) }}, <a style="user-select: none; cursor: pointer;" v-on:click="showAllIdent = true">...</a></template>
          <template v-else-if="index == 'model' && deviceModelArr.length > 5 && !showAllModel">{{ i.replace(deviceModelArr.join(', '), deviceModelArr.slice(0, 3).join(', ')) }}, <a style="user-select: none; cursor: pointer;" v-on:click="showAllModel = true">...</a></template>
          <template v-else-if="index == 'board' && deviceBoardArr.length > 5 && !showAllBoard">{{ i.replace(deviceBoardArr.join(', '), deviceBoardArr.slice(0, 3).join(', ')) }}, <a style="user-select: none; cursor: pointer;" v-on:click="showAllBoard = true">...</a></template>
          <template v-else>{{ i }}</template>
        </div>
      </div>
      <img id="flexImg" :src="`/assets/images/device@1024/${deviceIdentifierArr[0]}/0.png`" :style="`max-height: ${Object.keys(infoData).length * 1.8}em; max-width: 100%; margin-left: ${(wrapImg) ? 'auto' : 0}; margin-right: ${(wrapImg) ? 'auto' : 0}; padding-top: ${(wrapImg) ? '1em' : 0};`">
    </p>
    <h2 v-html="groupHeader" v-if="groupedDevices && groupedDevices.length > 0"/>
    <ul>
      <li v-for="d in groupedDevices" :key="d">
        <router-link v-html="d.name" :to="devicePath + d.identifier + '.html'"/>
      </li>
    </ul>
  </template>
  <h2 v-if="!frontmatter.mainList" v-html="tableHeader"/>
  <ul class="tableOptionsWrapper">
    <li>
      <div class="chartDropdown">
        <i class="fas fa-cog"></i>
        {{ optionsStr }}
        <span class="arrow down"></span>
      </div>
      <div class="chartDropdownBox opaqueHover">
        <ul>
          <li class="dropdown-item" v-if="!frontmatter.mainList && !noJb">
            <input type="checkbox" v-model="simpleTable" id="simpleTableCheckbox">
            <label for="simpleTableCheckbox">{{ simpleTableStr }}</label>
          </li>
          <!--<li class="dropdown-item" v-if="osTypeArr.length > 1">
            <input type="checkbox" v-model="complexTable" id="complexTableCheckbox">
            <label for="complexTableCheckbox">{{ complexTableStr }}</label>
          </li>-->
          <li class="dropdown-item" style="padding: 0px" v-if="!frontmatter.mainList && !noJb"><hr></li>
          <li class="dropdown-item">
            <input type="checkbox" v-model="showBeta" id="showBetaCheckbox">
            <label for="showBetaCheckbox">{{ showBetaStr }}</label>
          </li>
          <li class="dropdown-item">
            <input type="checkbox" v-model="showStable" id="showStableCheckbox">
            <label for="showStableCheckbox">{{ showStableStr }}</label>
          </li>
          <template v-if="!simpleTable">
            <li class="dropdown-item" style="padding: 0px"><hr></li>
            <!--<li class="dropdown-item">
              <input type="checkbox" v-model="showGuide" id="showGuideCheckbox">
              <label for="showGuideCheckbox">{{ showGuideStr }}</label>
            </li>-->
            <li class="dropdown-item">
              <input type="checkbox" v-model="showBuildNum" id="showBuildNumCheckbox">
              <label for="showBuildNumCheckbox">{{ showBuildNumStr }}</label>
            </li>
            <li class="dropdown-item">
              <input type="checkbox" v-model="showVersion" id="showVersionCheckbox">
              <label for="showVersionCheckbox">{{ showVersionStr }}</label>
            </li>
            <li class="dropdown-item" v-if="!noJb">
              <input type="checkbox" v-model="showJailbreak" id="showJailbreakCheckbox">
              <label for="showJailbreakCheckbox">{{ showJailbreakStr }}</label>
            </li>
            <li class="dropdown-item" v-if="!frontmatter.mainList && !(!noJb && deviceIdentifierArr.length == 1)">
              <input type="checkbox" v-model="showDownload" id="showDownloadCheckbox">
              <label for="showDownloadCheckbox">{{ showDownloadStr }}</label>
            </li>
            <li class="dropdown-item">
              <input type="checkbox" v-model="showReleaseDate" id="showReleaseDateCheckbox">
              <label for="showReleaseDateCheckbox">{{ showReleaseDateStr }}</label>
            </li>
          </template>
        </ul>
      </div>
    </li>
    <li v-if="frontmatter.mainList">
      <div class="chartDropdown">
        <i class="fas fa-filter"></i>
        {{ devicesStr }}
        <span class="arrow down"></span>
      </div>
      <div class="chartDropdownBox opaqueHover">
        <ul>
          <!--<li class="dropdown-item" v-for="type in osTypeArr" :key="type">
            <input type="checkbox" v-model="showOsTypeObj[type]" :id="type + 'checkbox'">
            <label :for="type + 'checkbox'">{{ showOSStr.format({ osType: type }) }}</label>
          </li>-->
          <li class="dropdown-item" v-for="dev in deviceFilterArr.sort()" :key="dev">
            <input v-if="showFwByDev.includes(dev)" type="checkbox" v-on:click="toggleDeviceFilter(dev)" :id="dev + 'checkbox'" checked>
            <input v-else type="checkbox" v-on:click="toggleDeviceFilter(dev)" :id="dev + 'checkbox'">
            <label :for="dev + 'checkbox'">{{ dev }}</label>
          </li>
        </ul>
      </div>
    </li>
  </ul>
  <div :class="'tableContainer' + (complexTable) ? ' complexTableContainer' : ''">
    <table>
      <tr v-if="fwArr.length">
        <template v-if="simpleTable">
          <th v-html="fromStr"/>
          <th v-html="toStr"/>
          <th v-html="jailbreakStr"/>
        </template>
        <template v-else>
          <th v-if="showBuildNum">{{ buildStr }}</th>
          <th v-if="showVersion">{{ versionStr }} <i v-on:click="sortBy == 'version' ? reverseSortingBtn() : sortBy = 'version'" class="fas fa-sort" style="float: right; user-select: none; cursor: pointer;"></i></th>
          <template v-if="complexTable && showJailbreak">
            <template v-for="group in groupArr" :key="group">
              <th class="complexTable">{{ group.name }}</th>
            </template>
          </template>
          <th v-else-if="showJailbreak">{{ jailbreakStr }}</th>
          <th v-if="showDownload">{{ downloadStr }}</th>
          <th v-if="showReleaseDate" style="width: 15%;">{{ releaseDateStr }} <i v-on:click="sortBy == 'released' ? reverseSortingBtn() : sortBy = 'released'" class="fas fa-sort" style="float: right; user-select: none; cursor: pointer;"></i></th>
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
          <td v-if="showBuildNum"><router-link :to="fw.path">{{fw.build}}</router-link></td>

          <td v-if="showVersion" class="showOnHover">
            <span v-if="!showBuildNum">
              <router-link :to="fw.path">{{fw.osStr}} {{fw.version}}<template v-if="(frontmatter.mainList && fw.duplicateVersion) || (!frontmatter.mainList && fwArr.filter(x => x.version == fw.version).length > 1)"> ({{fw.build}})</template></router-link>
            </span>
            <span v-else>{{fw.osStr}} {{fw.version}}</span>
            <span class="hoverElement" style="margin-left: .4em; position: absolute;" v-if="!showDownload && (!noJb && deviceIdentifierArr.length == 1 || smallScreen)">
              <template v-for="dev in fw.ipswObj" :key="dev">
                <template v-if="dev.ipsw && dev.ipsw != 'none'">
                  <a :href="dev.ipsw"> <i class="fas fa-download"></i></a>
                </template>
              </template>
            </span>
          </td>

          <template v-if="complexTable && showJailbreak">
            <td v-for="group in groupArr" :key="group">
              <template v-if="bigJbArr[fw.build][group.devices[0]] && bigJbArr[fw.build][group.devices[0]].length > 0">
                <span v-for="(jb, index) in bigJbArr[fw.build][group.devices[0]]" :key="jb">
                  <router-link :to="jailbreakPath + jb.name.replace(/ /g, '-') + '.html'" v-html="jb.name"/>
                  <span v-if="index+1 < bigJbArr[fw.build][group.devices[0]].length">, </span>
                </span>
              </template>
              <template v-else-if="!bigJbArr[fw.build][group.devices[0]]">
                {{noJbStr}}
              </template>
            </td>
          </template>
          
          <template v-else-if="showJailbreak">
            <td v-if="fw.jailbreakArr && fw.jailbreakArr.length > 0">
              <span v-for="(jb, index) in fw.jailbreakArr" :key="jb">
                <router-link :to="jailbreakPath + jb.name.replace(/ /g, '-') + '.html'" v-html="jb.name"/>
                <span v-if="index+1 < fw.jailbreakArr.length">, </span>
              </span>
            </td>
            <td v-else v-html="noJbStr"/>
          </template>

          <td v-if="showDownload">
            <template v-for="dev in fw.ipswObj" :key="dev">
              <div v-if="dev.ipsw != 'none'" class="showOnHover">
                <span v-if="Object.keys(fw.ipswObj).length > 1">{{dev.name}}: </span>
                <a :href="dev.ipsw">
                  {{dev.ipsw.split('/')[dev.ipsw.split('/').length-1]}}
                  <i class="fas fa-download opaqueHoverElement" style="margin-left: .4em; position: absolute;"></i>
                </a>
              </div>
              <div v-else>
                <span v-if="Object.keys(fw.ipswObj).length > 1">{{dev.name}}: </span>
                {{ noJbStr }}
              </div>
            </template>
          </td>
          
          <td v-if="showReleaseDate">{{fw.released}}</td>
        </tr>
        <tr v-if="index == entryCount - 1 && !simpleTable && !complexTable"><td :colspan="(simpleTable) ? 3 : (showBuildNum + showVersion + showJailbreak + showReleaseDate)">{{loadingStr}}</td></tr>
      </template>
    </table>
  </div>
  <p v-if="complexTable"><a style="cursor: pointer;" v-on:click="incrementRows()">{{loadMoreStr}}</a></p>
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
      timeLocale: 'en-US',

      infoHeader: 'Info',
      deviceStr: 'Device: ${dev}',
      identStr: 'Identifier: ${ident}',
      socStr: 'SoC: ${soc}',
      archStr: 'Arch: ${arch}',
      modelStr: 'Model: ${model}',
      boardStr: 'Board: ${board}',

      relatedHeader: 'Related Devices',
      groupedHeader: 'Grouped Devices',

      tableHeader: 'Version Table',

      showBetaStr: 'Show beta versions',
      showStableStr: 'Show stable versions',
      showOSStr: 'Show ${osType} versions',

      showBuildNumStr: 'Show build numbers',
      showVersionStr: 'Show version numbers',
      showJailbreakStr: 'Show jailbreaks',
      showDownloadStr: 'Show downloads',
      showReleaseDateStr: 'Show release date',

      showGuideStr: 'Show guide links',
      simpleTableStr: 'Simple table',
      complexTableStr: 'Show all devices',

      fromStr: 'From',
      toStr: 'To',
      buildStr: 'Build',
      versionStr: 'Version',
      jailbreakStr: 'Jailbreak',
      downloadStr: 'Download',
      releaseDateStr: 'Released',
      noJbStr: 'N/A',

      devicesStr: 'Devices',
      optionsStr: 'Options',
      loadingStr: 'Loading...',
      loadMoreStr: 'Load more firmwares',
      noFwStr: 'No software versions available.',

      showAllIdent: false,
      showAllModel: false,
      showAllBoard: false,

      sortBy: 'version',

      showBeta: false,
      showStable: true,
      showFwByDev: null,

      showBuildNum: false,
      showVersion: true,
      showJailbreak: true,
      showDownload: false,
      showReleaseDate: false,

      showDownloadsFor: [
        'macOS',
        'darwinOS'
      ],

      simpleTable: false,
      complexTable: false,
      showGuide: false,

      reverseSorting: true,
      fwArr: [],

      constEntryCount: 50,
      constMaxEntryCount: 99999,
      entryIncrement: 50,

      entryCount: 50,
      maxEntryCount: 99999,

      wrapImg: false,

      frontmatter: usePageFrontmatter(),
      devices: json.device,
      firmwares: json.ios,
      jailbreaks: json.jailbreak,
    }
  },
  computed: {
    deviceList() {
      const fm = this.frontmatter
      var deviceList = fm.device
      .map(x => this.devices[x])
      .map(function(x) {
        if (fm.mainList) {
          if (x.type.includes('iPad')) x.type = 'iPad'
          if (
            x.type == 'iPad' ||
            x.type == 'iPhone' ||
            x.type == 'iPod'
          ) x.type = 'iPhone, iPad, iPod'
          if (x.type.includes('Mac') || x.type == 'Developer Transition Kit') {
            x.type = 'Mac'
          }
        }
        return x
      })
      return deviceList
    },
    deviceNameStr() {
      const fm = this.frontmatter
      if (fm.name) return this.deviceStr.format({ dev: fm.name })

      var deviceList = this.deviceList
      if (!deviceList) return

      const deviceNameArr = removeNullAndDuplicatesAndSort(deviceList.map(x => x.name))
      if (deviceNameArr.length > 0) return this.deviceStr.format({ dev: deviceNameArr.join(', ') })
    },
    deviceIdentifierArr() {
      var deviceList = this.deviceList
      if (!deviceList) return
      
      const deviceIdentifierArr = removeNullAndDuplicatesAndSort(deviceList.map(x => x.identifier))
      return deviceIdentifierArr
    },
    deviceIdentifierStr() {
      const arr = this.deviceIdentifierArr
      if (arr.length > 0) return this.identStr.format({ ident: arr.join(', ') })
    },
    deviceSocStr() {
      var deviceList = this.deviceList
      if (!deviceList) return
      
      const deviceSocArr = removeNullAndDuplicatesAndSort(deviceList.map(x => x.soc))
      if (deviceSocArr.length > 0) return this.socStr.format({ soc: deviceSocArr.join(', ')})
    },
    deviceArchStr() {
      var deviceList = this.deviceList
      if (!deviceList) return
      
      const deviceArchArr = removeNullAndDuplicatesAndSort(deviceList.map(x => x.arch))
      if (deviceArchArr.length > 0) return this.archStr.format({ arch: deviceArchArr.join(', ')})
    },
    deviceModelArr() {
      var deviceList = this.deviceList
      if (!deviceList) return
      
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
    deviceBoardArr() {
      var deviceList = this.deviceList
      if (!deviceList) return
      
      const deviceBoardArr = removeNullAndDuplicatesAndSort(deviceList.map(function(x) {
        if (x.board) return x.board.join(', ')
        else return null
      }))

      var retArr = []
      for (var i of deviceBoardArr) retArr.push(...i.split(', '))

      retArr = removeNullAndDuplicatesAndSort(retArr)

      return retArr
    },
    deviceBoardStr() {
      const arr = this.deviceBoardArr
      if (arr.length > 0) return this.boardStr.format({ board: arr.join(', ') })
    },
    infoData() {
      const fm = this.frontmatter
      if (!fm.device && !fm.group) return []
      return {
        device: this.deviceNameStr,
        identifier: this.deviceIdentifierStr,
        soc: this.deviceSocStr,
        arch: this.deviceArchStr,
        model: this.deviceModelStr,
        board: this.deviceBoardStr
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
    },
    deviceFwArr() {
      const fm = this.frontmatter
      var devArr = fm.device

      var fwArr = []
      if (fm.mainList) fwArr = this.firmwares
      else {
        for (var d in devArr) {
          var devFwArr = this.firmwares.filter(function(x) {
            if (!x.hasOwnProperty('devices')) return 0
            else return Object.keys(x.devices).includes(devArr[d])
          })
          devFwArr.map(function(x) { if (!fwArr.includes(x)) fwArr.push(x) })
        }
      }

      return fwArr
    },
    deviceFilterArr() {
      return Array.from(new Set(this.deviceList.map(x => x.type)))
    },
    groupArr() {
      if (!this.complexTable) return
      const fwArr = this.fwArr
      const fwArrDevices = fwArr.map(x => x.devices).filter(x => x)
      var groupArr = []
      for (const i in fwArrDevices) {
        for (const j in fwArrDevices[i]) {
          if (!JSON.stringify(groupArr).includes(JSON.stringify(fwArrDevices[i][j].group)))
            groupArr.push(fwArrDevices[i][j].group)
        }
      }
      groupArr = groupArr.sort(function(a,b) {
        const sortType = [a.type, b.type]
        if (a.subtype) sortType[0] += ' ' + a.subtype
        if (b.subtype) sortType[1] += ' ' + b.subtype

        if (sortType[0] == 'iPhone' < sortType[1] == 'iPhone') return 1
        if (sortType[0] == 'iPhone' > sortType[1] == 'iPhone') return -1
        if (sortType[0] < sortType[1]) return 1
        if (sortType[0] > sortType[1]) return -1
        if (a.order < b.order) return 1
        if (a.order > b.order) return -1
        if (a.name < b.name) return 1
        if (b.name > b.name) return -1
        return 0
      })

      return groupArr
    },
    bigJbArr() {
      return this.frontmatter.bigObj
    }
  },
  methods: {
    reverseSortingBtn: function() {
      this.reverseSorting = !this.reverseSorting
    },
    toggleDeviceFilter: function(dev) {
      var d = this.showFwByDev
      if (d.includes(dev)) d.splice(d.indexOf(dev), 1)
      else d.push(dev)

      this.resetFwArr()
      
      const query = this.$route.query
      var retQueryArr = []

      if (query && query.filter) {
        var existingQuery = query.filter.split(';').filter(x => !this.deviceFilterArr.includes(x))
        retQueryArr.push(...existingQuery)
      }

      var newQuery = d
      if (newQuery.length == this.deviceFilterArr.length) newQuery = []
      retQueryArr.push(...newQuery)

      if (retQueryArr.length > 0) this.$router.push({query : { filter: retQueryArr.join(';') }})
      else this.$router.push({query: {}})
    },
    getFwArrMethod: function(val) {
      const fm = this.frontmatter
      var devArr = fm.device
      var fwArr = this.deviceFwArr
      if (!this.showFwByDev) this.showFwByDev = JSON.parse(JSON.stringify(this.deviceFilterArr))

      const showFwByDev = this.showFwByDev
      const showBeta = this.showBeta
      const showStable = this.showStable
      fwArr = fwArr.filter(function(fw) {
        const fwTypeArr = Object.keys(fw.devices).map(x => fw.devices[x].group.type)
        return (
          (
            (fwTypeArr.some(r=> showFwByDev.includes(r))) ||
            ((fwTypeArr.includes('iPad') || fwTypeArr.includes('iPhone') || fwTypeArr.includes('iPod')) && showFwByDev.includes('iPhone, iPad, iPod')) ||
            ((fwTypeArr.filter(x => x.includes('Mac')).length > 0 || fwTypeArr.includes('Developer Transition Kit')) && showFwByDev.includes('Mac'))
          ) && (
            (fw.beta && showBeta) ||
            (!fw.beta && showStable)
          )
        )
      })
      if (this.sortBy == 'released') fwArr = fwArr.sort(function(a,b) {
        const rel = [new Date(a.released), new Date(b.released)]
        if (rel[0] < rel[1]) return -1
        if (rel[0] > rel[1]) return 1
        return 0
      })
      if (this.reverseSorting) fwArr = fwArr.reverse()

      if (!this.simpleTable) {
        var filterVal = this.entryCount - this.entryIncrement
        fwArr = fwArr.filter((fw,index) => index < val)
          .filter((fw, index) => index >= filterVal)
      }

      var fwArrLength = this.fwArr.concat(fwArr).length
      if (fwArrLength <= this.entryCount) this.maxEntryCount = fwArrLength

      const jbList = this.jailbreaks
      const deviceList = this.deviceList

      for (var f in fwArr) {
        var jbArr = []
        const fw = fwArr[f]
        var fwDevArr = devArr.filter(x => Object.keys(fw.devices).includes(x) && Array.from(showFwByDev).includes(this.deviceList.filter(y => y.identifier == x)[0].type))
        for (var jb in jbList) {
          if (!jbList[jb].hasOwnProperty('compatibility')) continue
          for (var c in jbList[jb].compatibility) {
            if (!jbList[jb].compatibility[c].firmwares.includes(fw.uniqueBuild)) continue
            if (!jbList[jb].compatibility[c].devices.some(r=> fwDevArr.includes(r))) continue
            if (jbArr.includes(jbList[jb])) continue
            jbArr.push(jbList[jb])
          }
        }

        jbArr = jbArr.sort((a,b) => a.priority - b.priority)
        if (this.simpleTable) jbArr = jbArr.filter((jb, index) => index == 0)
        
        fwArr[f].jailbreakArr = jbArr
      }

      if (!this.frontmatter.mainList) {
        for (const fw of fwArr) {
          fw.ipswObj = {}
          for (const ident of this.deviceIdentifierArr) {
            const dev = fw.devices[ident]
            if (dev) {
              fw.ipswObj[ident] = {
                name: dev.name,
                identifier: ident,
                ipsw: dev.ipsw
              }
            }
          }
          if (
            Array.from(new Set(Object.keys(fw.ipswObj).map(x => fw.ipswObj[x].ipsw))).length == 1 &&
            Object.keys(fw.ipswObj).length == this.deviceIdentifierArr.length
          ) 
            fw.ipswObj = {
              "Device1,1": {
                name: 'Device',
                identifier: "Device1,1",
                ipsw: fw.ipswObj[Object.keys(fw.ipswObj)[0]].ipsw
              }
            }
        }
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
      if (!this.complexTable) window.onscroll = () => {
        let bottomOfWindow = document.documentElement.scrollTop + window.innerHeight > document.documentElement.offsetHeight * 0.6
        if (bottomOfWindow && !this.simpleTable) {
          this.incrementRows()
        }
      }
    },
    checkWrap: function() {
      const flexImg = document.getElementById('flexImg')
      const flexInfoWidth = document.getElementById('flexInfo').getBoundingClientRect().width

      const homeElement = document.getElementsByClassName('home')[0]
      var totalWidth = homeElement.clientWidth - parseFloat(window.getComputedStyle(homeElement).paddingLeft) - parseFloat(window.getComputedStyle(homeElement).paddingRight)
      var flexImgWidth = 0


      flexImg.onload = () => {
        flexImgWidth = flexImg.clientWidth
        this.wrapImg = totalWidth < flexInfoWidth + flexImgWidth + 10
      }

      window.onresize = () => {
        totalWidth = totalWidth = homeElement.clientWidth - parseFloat(window.getComputedStyle(homeElement).paddingLeft) - parseFloat(window.getComputedStyle(homeElement).paddingRight)
        this.wrapImg = totalWidth < flexInfoWidth + flexImgWidth + 10
      }
    },
    incrementRows: function() {
      var incr = this.entryIncrement / parseInt(this.complexTable + 1)
      if (this.entryCount + incr >= this.maxEntryCount) this.entryCount = this.maxEntryCount
      this.entryCount += incr
    },
    resetFwArr: function() {
      this.fwArr = []
      this.maxEntryCount = this.constMaxEntryCount
      this.fwArr = this.getFwArrMethod(this.constEntryCount / parseInt(this.complexTable + 1))
      this.entryCount = this.constEntryCount / parseInt(this.complexTable + 1)
    }
  },
  watch: {
    reverseSorting() {
      this.resetFwArr()
    },
    sortBy() {
      this.resetFwArr()
    },
    showBeta(bool) {
      this.resetFwArr()
      const query = this.$route.query
      var retQueryArr = []
      if (query && query.filter) {
        var existingQuery = query.filter.split(';').filter(x => !['stable','beta'].includes(x))
        retQueryArr.push(...existingQuery)
      }
      var newQuery = [this.showStable ? 'stable' : null, bool ? 'beta' : null].filter(x => x)
      if (newQuery.length == 1 & newQuery[0] == 'stable') newQuery = []
      retQueryArr.push(...newQuery)
      if (retQueryArr.length > 0) this.$router.push({query : { filter: retQueryArr.join(';') }})
      else this.$router.push({query: {}})
    },
    showStable(bool) {
      this.resetFwArr()
      const query = this.$route.query
      var retQueryArr = []
      if (query && query.filter) {
        var existingQuery = query.filter.split(';').filter(x => !['stable','beta'].includes(x))
        retQueryArr.push(...existingQuery)
      }
      var newQuery = [bool ? 'stable' : null, this.showBeta ? 'beta' : null].filter(x => x)
      if (newQuery.length == 1 & newQuery[0] == 'stable') newQuery = []
      retQueryArr.push(...newQuery)
      if (retQueryArr.length > 0) this.$router.push({query : { filter: retQueryArr.join(';') }})
      else this.$router.push({query: {}})
    },
    showGuide: function (bool) {
      this.resetFwArr()
    },
    simpleTable: function (bool) {
      this.resetFwArr()
    },
    entryCount: function(val) {
      this.fwArr = this.getFwArrMethod(val)
    }
  },
  created() {
    const query = this.$route.query
    if (Object.keys(query).length > 0) {
      if (query.filter) {
        var filterArr = query.filter.split(';')
        if (filterArr.includes('stable') || filterArr.includes('beta')) {
          this.showBeta = filterArr.includes('beta')
          this.showStable = filterArr.includes('stable')
          filterArr = filterArr.filter(x => x != 'stable' || x != 'beta')
        }
        const devArr = filterArr.filter(y => this.deviceFilterArr.includes(y))
        if (devArr.length > 0) this.showFwByDev = devArr
      }
    }
    this.resetFwArr()

    if (this.deviceFwArr.filter(x => !this.showDownloadsFor.includes(x.osStr)).length == 0) {
      this.showDownload = true
      this.showJailbreak = false
      this.noJb = true
    }
  },
  mounted() {
    this.loadMoreRows()
    if (!this.frontmatter.mainList) this.checkWrap()

    if (window.screen.width > 650) this.showReleaseDate = true
    else if (this.noJb) {
      this.showReleaseDate = true
      this.showDownload = false
      this.smallScreen = true
    }
  }
}
</script>

<style>
.flexWrapper {
  display: flex;
  justify-content: space-between;
}

.flexWrapper img {
  align-self: center;
  margin-right: 0;
  margin-left: 0;
}

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

.showOnHover .opaqueHoverElement {
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

.showOnHover:hover .opaqueHoverElement {
  opacity: 1;
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 100ms;
  display: inline !important;
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
  /*border: 1px solid var(--c-border);*/
  box-shadow: 0px 1px 6px var(--dropdown-shadow);
  max-height: 100%;
  transition: 300ms ease-in-out;
}

.chartDropdownBox:hover {
  left: auto;
  top: auto;
  padding: 1.5em 0.8em 1.5em 0em;
  /*border: 1px solid var(--c-border);*/
  box-shadow: 0px 1px 6px var(--dropdown-shadow);
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