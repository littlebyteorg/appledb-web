<template>
  <h2>Info</h2>
  <ul style="list-style-type: none; padding-left: 0;">
    <li>Version: {{ fm.build.osStr }} {{ fm.build.version }}</li>
    <li v-if="fm.build.build && fm.build.build != fm.build.version">Build: {{ fm.build.build }}</li>
    <li v-if="fm.build.released">Released: {{ fm.build.released }}</li>
  </ul>
</template>

<script>
import { usePageFrontmatter } from '@vuepress/client'

export default {
  data() {
    return {
      fm: usePageFrontmatter(),
    }
  }
}
</script>