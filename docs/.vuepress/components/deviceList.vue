<template>
    <table>
        <tr><th v-for="h in tableHeaderArr" :key="h">{{h}}</th></tr>
        <tr v-for="dev in modelList.concat(modellessDevices)" :key="dev">
            <td>{{dev.model}}</td>
            <td><router-link :to="'/device/' + dev.identifier.replace(/ /g,'-').replace(/\//g,'%2F') + '.html'">{{dev.name}}</router-link> <code v-if="dev.name != dev.identifier">{{dev.identifier}}</code></td>
            <td>{{dev.board ? dev.board.join(', ') : ''}}</td>
        </tr>
    </table>

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
      tableHeaderArr: [
          'Model',
          'Name',
          'Board'
      ],
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
          const noModelList = devList.filter(x => !x.hasOwnProperty('model') || !x.model || !x.model[0])
          return noModelList.sort((a,b) => {
            if (a.identifier.toLowerCase() < b.identifier.toLowerCase()) return -1
            if (a.identifier.toLowerCase() > b.identifier.toLowerCase()) return 1
            return 0
          })
      }
  }
}
</script>