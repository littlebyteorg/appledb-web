<template>
  <div>
    <p><div v-for="i in fm.infoData" :key="i"><span v-html="i"/></div></p>
    <h2 v-if="fm.deviceList && fm.deviceList.length > 0">{{ compatibilityHeader }}</h2>
    <ul style="list-style-type: none;">
      <li v-for="group in fm.deviceList" :key="group.groupKey" class="showOnHover">
        <i class="fas fa-chevron-down chevron chevronPoint" v-if="showMoreArr.includes(group.groupKey)"></i>
        <i class="fas fa-chevron-right chevron chevronPoint" v-else></i>
        <router-link :to="`${devicePath}${group.groupKey.fdn()}.html`">{{ group.name }}</router-link>

        <div class="hoverElement" style="display: inline;">
          <i class="fas fa-circle ml-" style="font-size: 0.3rem; opacity: 0.5; vertical-align: middle; margin-left: 2em; margin-right: 2em;"/>
          <a style="cursor: pointer" @click="showMoreArr.includes(group.groupKey) ? showMoreArr = showMoreArr.filter(x => x != group.groupKey) : showMoreArr.push(group.groupKey)">{{ showMoreArr.includes(group.groupKey) ? showLessStr : showMoreStr }}</a>
        </div>

        <table v-if="showMoreArr.includes(group.groupKey)">
          <thead>
            <tr>
              <th>{{ versionStr }}</th>
              <th v-for="d in group.devices" :key="d.key">{{ d.name }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="fw in group.firmwares" :key="fw">
              <td>{{fw.version}} (<router-link :to="fw.path">{{ fw.build }}</router-link>)</td>
              <td v-for="d in group.devices" :key="d">{{ fm.compat[d.key][fw.uniqueBuild] }}</td>
            </tr>
          </tbody>
        </table>
      </li>
    </ul>

    <p>AppleDB is not affiliated with Apple Inc.</p>
  </div>
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
      
      showMoreArr: [],
      
      fm: usePageFrontmatter()
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