<template>
  <form class="search-box" role="search">
    <input :placeholder="searchStr" :aria-placeholder="searchStr" v-model="searchQuery">
  </form>

  <table>
    <tr><th v-for="h in tableHeaderArr" :key="h">{{h}}</th></tr>
    <tr v-for="dev in deviceArr.filter(checkSearch)" :key="dev">
      <td>{{ dev.model }}</td>
      <td>
        <router-link :to="'/device/identifier/' + dev.identifier.fdn() + '.html'">
          {{dev.name}}
        </router-link>
        <code v-if="dev.name != dev.identifier">
          {{dev.identifier}}
        </code>
      </td>
      <td>{{ dev.board ? dev.board.join(', ') : '' }}</td>
      <td>{{ dev.soc ? Array.isArray(dev.soc) ? dev.soc.join(', ') : dev.soc : '' }}</td>
    </tr>
  </table>

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

String.prototype.format = function(vars) {
  let temp = this;
  for (let item in vars)
    temp = temp.replace("${" + item + "}", vars[item]);
  return temp
}

export default {
  data() {
    return {
      tableHeaderArr: [
          'Model',
          'Name',
          'Board',
          'SoC'
      ],
      searchQuery: '',
      searchProperties: [
        'model',
        'name',
        'identifier',
        'board',
        'soc'
      ],
      searchStr: 'Search',
      fm: usePageFrontmatter()
    }
  },
  computed: {
    modelList() {
      const devList = Object.keys(this.fm.deviceList).map(x => this.fm.deviceList[x])
      const modelArr = devList.map(x => x.model).flat().filter(x => x).sort()

      let modelDevArr = []
      let previousModel = ''
      let count = 0
      modelArr.map(x => {
        const devArr = devList.filter(y => y.model && y.model.includes(x))

        if (previousModel == x) count++
        else count = 0

        const dev = devArr[count]

        previousModel = x

        modelDevArr.push({
          name: dev.name,
          identifier: dev.identifier,
          model: x,
          released: dev.released,
          soc: dev.soc,
          arch: dev.arch,
          board: dev.board
        })
      })

      return modelDevArr
    },
    modellessDevices() {
      const devList = Object.keys(this.fm.deviceList).map(x => this.fm.deviceList[x])
      const noModelList = devList
      .filter(x => !x.hasOwnProperty('model') || !x.model || !x.model[0])
      .map(x => {
        if (Array.isArray(x.model)) x.model = ''
        return x
      })

      return noModelList.sort((a,b) => {
        if (a.identifier.toLowerCase() < b.identifier.toLowerCase()) return -1
        if (a.identifier.toLowerCase() > b.identifier.toLowerCase()) return 1
        return 0
      })
    },
    deviceArr() {
      return this.modelList.concat(this.modellessDevices)
    }
  },
  methods: {
    checkSearch(dev) {
      const searchQuery = this.searchQuery.toLowerCase()
      for (const p of this.searchProperties) {
        try {
          if (dev[p].toLowerCase().includes(searchQuery)) return true
        } catch {
          continue
        }
      }
      return false
    }
  }
}
</script>

<style scoped>
@media (max-width: 720px) {
  .search-box {
    margin-left: 0;
  }

  .search-box input {
    cursor: initial;
    width: initial;
    border-color: var(--search-border-color);
    position: static;
  }

  .search-box input:focus {
    border-color: var(--search-accent-color);
  }
}
</style>