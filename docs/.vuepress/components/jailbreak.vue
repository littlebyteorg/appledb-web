<template>
  <p><div v-for="i in fm.infoData" :key="i" v-html="i"/></p>
  <template v-if="fm.deviceList"><h2 v-if="fm.deviceList.length > 0" v-html="compatibilityHeader"/></template>
  <ul>
    <li v-for="g in fm.deviceList" :key="g" :id="`liCompat-${g.name}`" style="list-style-type: none;" class="showOnHover">
      <input type="checkbox" :id="`toggleListCompat-${g.name}`">
      <i class="fas fa-chevron-right chevron chevronPoint clickToHide"/>
      <i class="fas fa-chevron-down chevron chevronPoint clickToShow displayNone"/>
      <router-link v-html="g.name" :to="`${devicePath}${g.groupKey.fdn()}.html`"/>

      <div class="hoverElement" style="display: inline;">
        <i class="fas fa-circle ml-" style="font-size: 0.3rem; opacity: 0.5; vertical-align: middle; margin-left: 2em; margin-right: 2em;"/>
        <label :for="`toggleListCompat-${g.name}`"><a style="cursor: pointer;" :id="`toggleShowCompat-${g.name}`" v-html="showMoreStr" v-on:click="toggleShowCompat(g.name)"/></label>
      </div>
      <div class="clickToShow">
        <table>
          <tr>
            <th>{{ versionStr }}</th>
            <th v-for="d in g.devices" :key="d">{{ d.name }}</th>
          </tr>
          <tr v-for="fw in g.firmwares.reverse()" :key="fw">
            <td>{{fw.version}} (<router-link :to="fw.path">{{ fw.build }}</router-link>)</td>
            <td v-for="d in g.devices" :key="d">{{ fm.compat[d.key][fw.uniqueBuild] }}</td>
          </tr>
        </table>
      </div>
    </li>
  </ul>

  <p>AppleDB is not affiliated with Apple Inc.</p>
</template>

<script>
import { usePageFrontmatter } from '@vuepress/client'

String.prototype.fdn = function() {
  return this
  .replace(/ /g, '-')
  .replace(/\//g,'%2F')
  .replace(/ü/g,'u')
  .replace(/²/g,'2')
  .replace(/³/g,'3')
}

export default {
  data() {
    return {
      devicePath: '/device/',

      infoHeader: 'Info',

      compatibilityHeader: 'Compatibility Listing',
      showMoreStr: 'Show More',
      showLessStr: 'Show Less',
      versionStr: 'Version',
      
      fm: usePageFrontmatter()
    }
  },
  methods: {
    toggleShowCompat: function (id, event) {
      var liID = `liCompat-${id}`
      var liClassList = document.getElementById(liID).classList
      if (liClassList.contains('showOnHover')) liClassList.remove('showOnHover')
      else liClassList.add('showOnHover')
      document.getElementById(liID).classList = liClassList

      var toggleID = `toggleShowCompat-${id}`
      var toggleInner = document.getElementById(toggleID).innerHTML
      if (toggleInner == this.showMoreStr) toggleInner = this.showLessStr
      else toggleInner = this.showMoreStr
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