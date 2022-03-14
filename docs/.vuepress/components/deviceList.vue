<template>
  <!--<h3>{{ contentsStr }}</h3>
  <ul>
    <li v-for="type in groupObj" :key="type"><a :href="'#' + type[0].type.replace(/ /g, '-')">{{type[0].type}}</a></li>
  </ul>
  <hr>
  <template v-for="type in groupObj" :key="type">
    <h3 :id="type[0].type.replace(/ /g, '-')">{{type[0].type}}</h3>
    <ul>
      <li v-for="dev in type.filter(x => !x.hideiOSCFW)" :key="dev"><router-link :to="dev.url">{{ dev.name }}</router-link></li>
    </ul>
  </template>-->
  <table>
    <tr>
      <th>{{deviceStr}}<i v-on:click="sortBy == 'name' ? sortReverse = !sortReverse : sortBy = 'name'" class="fas fa-sort" style="float: right; cursor: pointer;"></i></th>
      <th>{{typeStr}}<i v-on:click="sortBy == 'type' ? sortReverse = !sortReverse : sortBy = 'type'" class="fas fa-sort" style="float: right; cursor: pointer;"></i></th>
      <th>{{socStr}}<i v-on:click="sortBy == 'soc' ? sortReverse = !sortReverse : sortBy = 'soc'" class="fas fa-sort" style="float: right; cursor: pointer;"></i></th>
      <th>{{archStr}}<i v-on:click="sortBy == 'arch' ? sortReverse = !sortReverse : sortBy = 'arch'" class="fas fa-sort" style="float: right; cursor: pointer;"></i></th>
    </tr>
    <tr v-for="group in groupList" :key="group">
      <td><router-link :to="group.url">{{group.name}}</router-link></td>
      <td>{{group.type}}</td>
      <td>{{group.soc}}</td>
      <td>{{group.arch}}</td>
    </tr>
  </table>
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
      deviceStr: 'Device',
      typeStr: 'Type',
      socStr: 'SoC',
      archStr: 'Arch',

      sortBy: 'type',
      sortReverse: false,
      groupList: [],

      frontmatter: usePageFrontmatter()
    }
  },
  computed: {
    groupObj() {
      const groupList = this.groupList
      const typeArr = new Set(this.groupList.map(x => x.type))
      var o = {}
      for (const i of typeArr) o[i] = groupList.filter(x => x.type == i)
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