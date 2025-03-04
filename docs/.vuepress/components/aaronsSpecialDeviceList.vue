<template>
  <form onsubmit="event.preventDefault();" class="search-box" role="search">
    <input :placeholder="searchStr" :aria-placeholder="searchStr" v-model="searchQuery">
  </form>

  <h3>"A" Model Number Tracker</h3>

  <div class="progressBar">
    <div :style="{
      'width': `calc(${String(parseInt(aModelArr.length / totalAModel * 100))}% - 1.5em)`
    }">
      {{ aModelArr.length }} / {{ totalAModel }}
    </div>
    <div :style="{
      'width': `calc(${String(100 - parseInt(aModelArr.length / totalAModel * 100))}% - 1.5em)`
    }">
      {{ (aModelArr.length / totalAModel * 100).toFixed(2) }}%
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th v-for="h in [
            'Model',
            'Name',
            'Released',
            'Identifier'
          ]" :key="h">{{h}}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="dev in deviceArr.filter(checkSearch)" :key="dev">
        <td>{{ dev.model }}</td>
        <td>
          <router-link :to="'/device/identifier/' + dev.key.fdn() + '.html'">
            {{dev.name}}
          </router-link>
        </td>
        <td><span v-if="dev.released">{{ Array.isArray(dev.released) ? dev.released.join(', ') : dev.released }}</span></td>
        <td><code v-if="dev.identifier[0] && dev.name != dev.identifier">
          {{ dev.identifier.join(', ') }}
        </code></td>
      </tr>
    </tbody>
  </table>

  <p>AppleDB is not affiliated with Apple Inc.</p>
</template>

<script>
import { usePageFrontmatter } from '@vuepress/client'
import substitutes from '../plugins/writeTemp/lib/deviceNameSubstitutes.json'

String.prototype.fdn = function() {
    let arr = this.split('')
    for (let c in arr) for (var i = 0; i < substitutes.length / 2; i++)
        if (arr[c] == substitutes[i*2]) arr[c] = substitutes[i*2+1]
    return arr.join('')
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
      searchQuery: '',
      searchProperties: [
        'model',
        'name',
        'identifier',
        'key',
        'board',
        'soc'
      ],
      searchStr: 'Search',
      fm: usePageFrontmatter()
    }
  },
  computed: {
    devList() { return Object.keys(this.fm.deviceList).map(x => this.fm.deviceList[x]) },
    modelArr() { return this.devList.map(x => x.model).flat().filter(x => x).sort() },
    aModelArr() { return [...new Set(this.modelArr.filter(x => x.length == 5 && x[0] == 'A'))] },
    totalAModel() {
      const sortedModelArr = this.aModelArr.map(x => parseInt(x.slice(1))).sort()
      return sortedModelArr.slice(-1)[0] - sortedModelArr.slice(0)[0]
    },
    modelList() {
      let modelDevArr = []
      let previousModel = ''
      let count = 0
      this.modelArr.map(x => {
        const devArr = this.devList.filter(y => y.model && y.model.includes(x))

        if (previousModel == x) count++
        else count = 0

        const dev = devArr[count]
        if (!dev) return

        previousModel = x

        modelDevArr.push({
          name: dev.name,
          identifier: dev.identifier,
          key: dev.key,
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
      const noModelList = this.devList
      .filter(x => !x.hasOwnProperty('model') || !x.model || !x.model[0])
      .map(x => {
        if (Array.isArray(x.model)) x.model = ''
        return x
      })

      return noModelList.sort((a,b) => {
        const sortBy = [a,b].map(x => x.identifier[0] || x.name || x.key)
        if (sortBy[0].toLowerCase() < sortBy[1].toLowerCase()) return -1
        if (sortBy[0].toLowerCase() > sortBy[1].toLowerCase()) return 1
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

<style scoped lang="scss">
.progressBar {
  display: flex;
  flex-flow: row wrap;
  margin-block: 1em;

  div {
    background: black;
    padding: .75em;
    font-weight: 600;

    &:first-of-type {
      border-radius: 1em 0px 0px 1em;
      background: var(--c-text-lightest);
      color: var(--c-bg);
    }

    &:last-of-type {
      border-radius: 0px 1em 1em 0px;
      background: var(--c-border);
      text-align: right;
    }
  }
}

html.dark .progressBar div {
  &:first-of-type {
    background: var(--c-border);
    color: inherit;
  }

  &:last-of-type {
    background: var(--c-bg-light);
  }
}

.search-box {
  margin-left: 0;
}

@media (max-width: 720px) {
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