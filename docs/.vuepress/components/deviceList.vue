<template>
  <!--<h3>{{ devicesStr }}</h3>
  <table v-for="i of Math.ceil(Object.keys(groupObj).length / rowLength)" :key="i">
    <tr v-for="row of 2" :key="row">
      <template v-for="j of rowLength" :key="j">
        <template v-if="Object.keys(groupObj).length > (j - 1) + (i - 1) * rowLength">
          <th class="columnWidth" v-if="row == 1">{{ Object.keys(groupObj)[(j - 1) + (i - 1) * rowLength] }}</th>
          <td class="columnWidth" v-else-if="row == 2">
            <a>
              <img :src="`https://ipsw.me/assets/devices/${groupObj[Object.keys(groupObj)[(j - 1) + (i - 1) * rowLength]][0].devices[0]}.png`" alt="Device image" style="width: 50%;">
            </a>
          </td>
        </template>
        <template v-else>
          <th class="columnWidth" v-if="row == 1"></th>
          <td class="columnWidth" v-else-if="row == 2"></td>
        </template>
      </template>
    </tr>
  </table>-->
  <h3>{{ contentsStr }}</h3>
  <ul>
    <li v-on:click="sortBy = 'type'" v-for="type in groupObj" :key="type">
      <a :href="'#' + type[0].type.replace(/ /g, '-')">{{type[0].type}}</a>
    </li>
  </ul>
  <h3 v-if="sortBy == 'type'" :id="groupList[0].type.replace(/ /g, '-')">{{groupList[0].type}}</h3>
  <div class="tableContainer">
    <table>
      <tr>
        <th>{{deviceStr}}<i v-on:click="sortBy == 'name' ? sortReverse = !sortReverse : sortBy = 'name'" class="fas fa-sort" style="float: right; cursor: pointer;"></i></th>
        <th>{{typeStr}}<i v-on:click="sortBy == 'type' ? sortReverse = !sortReverse : sortBy = 'type'" class="fas fa-sort" style="float: right; cursor: pointer;"></i></th>
        <th>{{socStr}}<i v-on:click="sortBy == 'soc' ? sortReverse = !sortReverse : sortBy = 'soc'" class="fas fa-sort" style="float: right; cursor: pointer;"></i></th>
        <th>{{archStr}}<i v-on:click="sortBy == 'arch' ? sortReverse = !sortReverse : sortBy = 'arch'" class="fas fa-sort" style="float: right; cursor: pointer;"></i></th>
      </tr>
      <template v-for="(group, index) in groupList" :key="group">
        <tr>
          <td><router-link :to="group.url">{{group.name}}</router-link></td>
          <td>{{group.type}}</td>
          <td>{{group.soc}}</td>
          <td>{{group.arch}}</td>
        </tr>
        <h3 :id="groupList[index+1].type.replace(/ /g, '-')" v-if="sortBy == 'type' && groupList[index+1] && (groupList[index].type != groupList[index+1].type)" style="text-align: initial;">{{groupList[index+1].type}}</h3>
      </template>
    </table>
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
      contentsStr: 'Contents',
      deviceStr: 'Device',
      devicesStr: 'Devices',
      typeStr: 'Type',
      socStr: 'SoC',
      archStr: 'Arch',

      sortBy: 'type',
      sortReverse: false,
      groupList: [],

      rowLength: 3,

      frontmatter: usePageFrontmatter()
    }
  },
  computed: {
    constGroupList() {
      const fm = this.frontmatter
      const devList = fm.deviceList.map(function(x) {
        if (x.subtype && !x.type.includes(x.subtype)) x.type = [x.type,x.subtype].join(' ')
        x.url = `/device/${x.name.replace(/ /g, '-')}.html`
        x.soc = Array.isArray(x.soc) ? x.soc[0] : x.soc
        x.arch = Array.isArray(x.arch) ? x.arch[0] : x.arch
        return x
      })
      return devList
    },
    groupObj() {
      const list = this.constGroupList
      const typeArr = new Set(list.map(x => x.type))
      var o = {}
      for (const i of typeArr) o[i] = list.filter(x => x.type == i)
      return o
    }
  },
  methods: {
    createGroupList() {
      const fm = this.frontmatter
      const devList = fm.deviceList.map(function(x) {
        if (x.subtype && !x.type.includes(x.subtype)) x.type = [x.type,x.subtype].join(' ')
        x.url = `/device/${x.name.replace(/ /g, '-')}.html`
        x.soc = Array.isArray(x.soc) ? x.soc[0] : x.soc
        x.arch = Array.isArray(x.arch) ? x.arch[0] : x.arch
        return x
      })
      return devList
    }
  },
  created() {
    this.groupList = this.createGroupList()
  },
  watch: {
    sortReverse() {
      this.groupList = this.groupList.reverse()
    },
    sortBy(val) {
      if (val == 'type') this.groupList = this.createGroupList()
      else if (val == 'soc') {
        this.groupList = this.groupList.sort(function(a,b) {
          if (/^[A-Z]\d+/.test(a[val]) || /^[A-Z]\d+/.test(b[val])) {

            const socPrefix = [a[val].toString()[0], b[val].toString()[0]]
            if (socPrefix.includes('S')) console.log(a, b)
            if (socPrefix[0] < socPrefix[1]) return -1
            if (socPrefix[0] > socPrefix[1]) return 1

            function getNum(v) { return parseInt(v.toString().replace(/[^0-9]/g, '')) }
            const num = [getNum(a[val]), getNum(b[val])]

            if (num[0] < num[1]) return -1
            if (num[0] > num[1]) return 1

            function getSuffix(v) { return Array.from(v.toString().replace(/[0-9]/g, '')).filter((x, index) => index > 0).join('') }
            const suffix = [getSuffix(a[val]), getSuffix(b[val])]
            if (suffix[0] < suffix[1]) return -1
            if (suffix[0] > suffix[1]) return 1
            
            return 0
          } else {
            if (a[val] > b[val]) return -1
            else if (a[val] < b[val]) return 1
            else return 0
          }
        })
      }
      else {
        this.groupList = this.groupList.sort(function(a,b) {
          if (a[val] > b[val]) return -1
          else if (a[val] < b[val]) return 1
          else return 0
        })
      }
    }
  }
}
</script>

<style>
.columnWidth {
  width: 33%;
}
</style>