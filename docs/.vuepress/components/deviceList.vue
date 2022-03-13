<template>
  <h3>{{ contentsStr }}</h3>
  <ul>
    <li v-for="type in groupObj" :key="type"><a :href="'#' + type[0].type.replace(/ /g, '-')">{{type[0].type}}</a></li>
  </ul>
  <hr>
  <template v-for="type in groupObj" :key="type">
    <h3 :id="type[0].type.replace(/ /g, '-')">{{type[0].type}}</h3>
    <ul>
      <li v-for="dev in type.filter(x => !x.hideiOSCFW)" :key="dev"><router-link :to="dev.url">{{ dev.name }}</router-link></li>
    </ul>
  </template>
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
      frontmatter: usePageFrontmatter()
    }
  },
  computed: {
    groupList() {
      const fm = this.frontmatter
      const devList = fm.deviceList
      return devList.map(function(x) {
        if (x.subtype && !x.type.includes(x.subtype)) x.type = [x.type,x.subtype].join(' ')
        x.url = `/device/${x.name.replace(/ /g, '-')}.html`
        return x
      })
    },
    groupObj() {
      const groupList = this.groupList
      const typeArr = new Set(this.groupList.map(x => x.type))
      var o = {}
      for (const i of typeArr) o[i] = groupList.filter(x => x.type == i)
      return o
    }
  }
}
</script>