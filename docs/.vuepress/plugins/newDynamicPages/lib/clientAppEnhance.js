import { defineClientAppEnhance } from '@vuepress/client'
import chartLayout from '../../../components/chartLayout.vue'

export default defineClientAppEnhance(({ app, router, siteData }) => {
  app.component('chartLayout', chartLayout)
})