<template>
  <main class="page">
    <div class="theme-default-content">
      <pageTitle :content="titleContent"/>
      <div v-if="adUnits && adUnits.length > 0" :id="`waldo-tag-${adUnits[0]}`"></div>
      <template v-for="section in sections" :key="section.title">
        <h2 v-if="section.title">{{ section.title }}</h2>
        <vueSection :section="section"/>
      </template>
      <div v-if="adUnits && adUnits.length > 1" :id="`waldo-tag-${adUnits[1]}`"></div>
    </div>
  </main>
</template>

<script>
import { useThemeLocaleData } from '@vuepress/theme-default/lib/client/composables'

export default {
  data() {
    return {
      titleContent: {},
      sections: [],
      adUnits: useThemeLocaleData().value.adUnits,
    }
  },
  async created() {
    let data = await this.getPageData()
    this.titleContent = data.title
    this.sections = data.sections
    document.title = this.titleContent.header + ' | AppleDB'
  },
  mounted() {
    document.title = this.titleContent.header // Yes this needs to be done twice idk why
  },
  methods: {
    getPageData() {
      const routeName = this.$route.name
      const routeParams = Object.keys(this.$route.params).map(x => this.$route.params[x])
      
      return fetch(`/pageData/${routeName}/${routeParams.join(';')}.json`.replace(/\.html/g,''), {
          method: 'GET',
	        headers: { 'Content-Type': 'application/json' }
        }
      )
      .then((response) => response.text())
      .then((response) => JSON.parse(response));
    }
  }
}
</script>