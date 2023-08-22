<template>
  <h2 v-html="infoHeader"/>
  <ul style="list-style-type: none; padding-left: 0;">
    <li v-html="verStr.format({ verNum: [fm.build.osStr,fm.build.version].join(' ') })"/>
    <li v-if="fm.build.build != fm.build.version" v-html="buildStr.format({ buildId: fm.build.build })"/>
    <li v-if="fm.released != -1" v-html="releasedStr.format({releasedTime: fm.released})"/>
    <li
      v-if="
        fm.devGroupArr &&
        fm.devGroupArr[0] &&
        fm.devGroupArr[0].devices[0].ipsw &&
        Array.from(new Set(fm.devGroupArr.map(x => x.devices).flat().map(x => x.ipsw))).length == 1 &&
        fm.devGroupArr[0].devices[0].ipsw != 'none'
      "
      v-html="downloadInfoStr.format({ ipsw: fm.devGroupArr[0].devices[0].ipsw, ipswStr: [fm.devGroupArr[0].devices[0].ipsw.split('/')[fm.devGroupArr[0].devices[0].ipsw.split('/').length-1]] })"
    />
  </ul>

  <h2 v-if="fm.jailbreakArr.length > 0" v-html="jailbreaksHeader"/>
  <ul>
    <li v-for="(jb, index) in fm.jailbreakArr" :key="jb" :id="`liJb-${jb.name.replace(/ /g, '-')}`" style="list-style-type: none;" class="showOnHover">
      <template v-if="fm.jbDevArr[index].length > 0">
        <input type="checkbox" :id="`toggleListJb-${jb.name.replace(/ /g, '-')}`">
        <i class="fas fa-chevron-right chevron chevronPoint clickToHide"/>
        <i class="fas fa-chevron-down chevron chevronPoint clickToShow displayNone"/>
      </template>
      <template v-else>
        <i class="fas fa-circle circle"/>
      </template>
      <router-link v-html="jb.name" :to="`${jailbreakPath}${jb.name}.html`"/>
      
      <template v-if="fm.jbDevArr[index].length > 0">
        <div class="hoverElement" style="display: inline;">
          <i class="fas fa-circle ml-" style="font-size: 0.3rem; opacity: 0.5; vertical-align: middle; margin-left: 2em; margin-right: 2em;"/>
          <label :for="`toggleListJb-${jb.name.replace(/ /g, '-')}`"><a style="cursor: pointer;" :id="`toggleShowJb-${jb.name.replace(/ /g, '-')}`" v-html="showDevStr" v-on:click="toggleShowJb(jb.name.replace(/ /g, '-'))"/></label>
        </div>
        <div class="custom-container tip clickToShow">
          <p>
            <ul>
              <li class="showOnHover" style="list-style-type: disc" v-for="d in fm.jbDevArr[index]" :key="d">
                <router-link :to="d.url" v-html="d.name"/>
              </li>
            </ul>
          </p>
        </div>
      </template>
    </li>
  </ul>

  <div v-if="fm.devGroupArr && fm.devGroupArr.length > 0">
    <h2 v-html="devicesHeader"/>
    <ul :style="(fm.devGroupArr.filter(x=>x.devices.length > 1).length > 0) ? 'list-style-type: none' : ''">
      <li v-for="g in fm.devGroupArr" :key="g" :id="`liDev-${g.name.replace(/ /g, '-')}`" class="showOnHover">
        <template v-if="
          fm.devGroupArr.filter(x=>x.devices.length > 1).length > 0 &&
          g.devices.length > 1
        ">
          <input type="checkbox" :id="`toggleListDev-${g.name.replace(/ /g, '-')}`">
          <i class="clickToHide fas fa-chevron-right chevron chevronPoint"/>
          <i class="clickToShow fas fa-chevron-down chevron chevronPoint"/>
        </template>
        <template v-else>
          <i class="fas fa-circle circle"/>
        </template>

        <router-link :to="g.url" v-html="g.name"/>

        <template v-if="g.devices.length > 1">
          <div class="hoverElement" style="display: inline;">
            <i class="fas fa-circle ml-" style="font-size: 0.3rem; opacity: 0.5; vertical-align: middle; margin-left: 2em; margin-right: 2em;"/>
            <label :for="`toggleListDev-${g.name.replace(/ /g, '-')}`"><a style="cursor: pointer;" :id="`toggleShowDev-${g.name.replace(/ /g, '-')}`" v-html="showMoreStr" v-on:click="toggleShowDev(g.name.replace(/ /g, '-'))"/></label>
          </div>
          <div class="custom-container tip clickToShow">
            <p>
              <ul>
                <li class="showOnHover" style="list-style-type: disc" v-for="d in g.devices" :key="d">
                  <router-link :to="d.url" v-html="d.name"/>
                  <a v-if="d.ipsw != 'none' && d.ipsw" class="hoverElement" :href="d.ipsw">
                    <i class="fas fa-download chevron" style="margin-left: 0.8em; margin-right: 0.5em;"/>
                    <span style="font-weight: 500;" v-html="downloadStr"/>
                  </a>
                </li>
              </ul>
            </p>
          </div>
        </template>
        <template v-else>
          <span v-if="g.devices[0].ipsw != 'none' && g.devices[0].ipsw" class="hoverElement">
            <i class="fas fa-circle ml-" style="font-size: 0.3rem; opacity: 0.5; vertical-align: middle; margin-left: 2em; margin-right: 2em;"/>
            <a :href="g.devices[0].ipsw">
              <i class="fas fa-download" style="margin-right: 0.5em;"></i>
              <span style="font-weight: 500;">{{ downloadStr }}</span>
            </a>
          </span>
        </template>
      </li>
    </ul>
  </div>
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
      devicePath: '/device/',
      jailbreakPath: '/jailbreak/',
      timeLocale: 'en-US',

      infoHeader: 'Info',
      verStr: 'Version: ${verNum}',
      buildStr: 'Build: ${buildId}',
      releasedStr: 'Released: ${releasedTime}',
      basedOnStr: 'Based on: ${iosVersion}',
      downloadInfoStr: 'Download: <a href="${ipsw}">${ipswStr} <i class="fas fa-download"></i></a>',

      relatedFirmwaresHeader: 'Related Firmware',

      devicesHeader: 'Devices',
      showMoreStr: 'Show More',
      showLessStr: 'Show Less',
      downloadStr: 'Download IPSW',

      jailbreaksHeader: 'Jailbreaks',
      showDevStr: 'Show Devices',
      hideDevStr: 'Hide Devices',
      
      fm: usePageFrontmatter(),
    }
  },
  methods: {
    toggleShowDev: function (id, event) {
      var liID = `liDev-${id}`
      var liClassList = document.getElementById(liID).classList
      if (liClassList.contains('showOnHover')) liClassList.remove('showOnHover')
      else liClassList.add('showOnHover')
      document.getElementById(liID).classList = liClassList

      var toggleID = `toggleShowDev-${id}`
      var toggleInner = document.getElementById(toggleID).innerHTML
      if (toggleInner == this.showMoreStr) toggleInner = this.showLessStr
      else toggleInner = this.showMoreStr
      document.getElementById(toggleID).innerHTML = toggleInner
    },
    toggleShowJb: function (id, event) {
      var liID = `liJb-${id}`
      var liClassList = document.getElementById(liID).classList
      if (liClassList.contains('showOnHover')) liClassList.remove('showOnHover')
      else liClassList.add('showOnHover')
      document.getElementById(liID).classList = liClassList

      var toggleID = `toggleShowJb-${id}`
      var toggleInner = document.getElementById(toggleID).innerHTML
      if (toggleInner == this.showDevStr) toggleInner = this.hideDevStr
      else toggleInner = this.showDevStr
      document.getElementById(toggleID).innerHTML = toggleInner
    },
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

.circle {
  float: left;
  margin-left: -2.6em;
  margin-top: 1.8em;
  font-size: 0.4em;
}

.showOnHover .hoverElement {
  opacity: 0;
  display: none !important;
}

.displayNone {
  display: none !important;
}

.showOnHover:hover .hoverElement {
  opacity: 0.3;
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