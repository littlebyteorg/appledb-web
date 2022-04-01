<template>
    <p v-for="s in introStr" :key="s">{{ s }}</p>
    
    <table v-for="t in Math.ceil(deviceArr.length / colCount)" :key="t">
        <tr>
            <th v-for="c in colCount" :key="c">
                <router-link v-if="deviceArr[(t - 1) * colCount + c - 1]" :to="`/device/${deviceArr[(t - 1) * colCount + c - 1].name.replace(/ /g, '-')}.html`">
                    {{ deviceArr[(t - 1) * colCount + c - 1].name.replace('generation', 'gen') }}
                </router-link>
            </th>
        </tr>
        <tr>
            <td v-for="c in colCount" :key="c">
                <router-link v-if="deviceArr[(t - 1) * colCount + c - 1]" :to="`/device/${deviceArr[(t - 1) * colCount + c - 1].name.replace(/ /g, '-')}.html`">
                    <img :src="`/assets/images/device/${deviceArr[(t - 1) * colCount + c - 1].devices[0]}.png`" style="height: 8em;">
                </router-link>
            </td>
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
            colCount: 3,
            frontmatter: usePageFrontmatter(),
        }
    },
    computed: {
        introStr() {
            return [
                `Please select what model of ${this.frontmatter.type} you have below.`
            ]
        },
        deviceArr() {
            return this.frontmatter.group
        }
    }
}
</script>

<style scoped>
table {
    table-layout: fixed;
}
tr {
    width: 33%;
}
</style>