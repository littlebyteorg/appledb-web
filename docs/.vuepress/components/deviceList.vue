<template>
  <table>
    <tr>
      <th>Device</th>
      <th>Type</th>
    </tr>
    <tr v-for="devGroup in groupList" :key="devGroup">
      <td><router-link :to="`/device/${devGroup.name.replace(/ /g, '-')}.html`">{{devGroup.name.replace('generation', 'gen')}}</router-link></td>
      <td>{{devGroup.type}} {{devGroup.subtype}}</td>
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
      frontmatter: usePageFrontmatter()
    }
  },
  computed: {
    groupList() {
      const fm = this.frontmatter
      return fm.deviceList
    }
  }
}
</script>