<template>
    <a :href="device.url"><div
        class="gridWrapper"
        :style="{
            'grid-template-columns': device.imgCount > 0 ? '3em calc(100% - 3em)' : '100%'
        }"
    >
        <div class="imgWrapper" v-if="device.imgCount"><picture>
            <source :srcset="`https://img.appledb.dev/device@preview/${device.imgKey}/${device.imgNames[0]}${isDarkMode && device.imgDark ? '_dark' : ''}.avif`" type="image/avif">
            <source :srcset="`https://img.appledb.dev/device@preview/${device.imgKey}/${device.imgNames[0]}${isDarkMode && device.imgDark ? '_dark' : ''}.webp`" type="image/webp">
            <img :src="`https://img.appledb.dev/device@preview/${device.imgKey}/${device.imgNames[0]}${isDarkMode && device.imgDark ? '_dark' : ''}.png`">
        </picture></div>
        <div class="info">
            <div class="title" style="color: var(--c-text);">{{ device.name }}</div>
            <div class="text" style="color: var(--c-text);">
                {{ device.released ? getDate(device.released) : 'Unknown' }}
            </div>
        </div>
    </div></a>
</template>

<script>
import { useDarkMode } from '@vuepress/theme-default/lib/client/composables'

String.prototype.format = function(vars) {
   let temp = this
   for (let item in vars)
     temp = temp.replace("${" + item + "}", vars[item])
   return temp
 }

export default {
    props: {
        device: Object
    },
    data() {
        return {
            isDarkMode: useDarkMode()
        }
    },
    methods: {
        getDate(date) {
            const dateArr = [date].flat().map(x => {
                const dateOffset = (new Date().getTimezoneOffset() * 60 * 1000) + (60 * 60000)
                const currentDate = new Date(x).valueOf()
                const adjustedDate = new Date(currentDate + dateOffset)

                const releasedArr = x.split('-')
                const dateStyleArr = [{ year: 'numeric' }, { year: 'numeric', month: 'short' }, { dateStyle: 'medium' }]
                const date = new Intl.DateTimeFormat('en-US', dateStyleArr[releasedArr.length-1]).format(adjustedDate)
                
                return date
            })
            return dateArr[0]
        }
    }
}
</script>

<style lang="scss" scoped>
.gridWrapper {
    padding: 1em;
    display: grid;
    gap: 0px 1em;
    border-radius: .7em;
    transition: 75ms background ease-in-out;

    &:hover {
        background: var(--c-border);
    }

    .imgWrapper {
        max-height: 8em;
        width: 3em;
    }

    .info {
        .title {
            font-weight: 600;
            font-size: 1.2em;
            padding-bottom: 6px;
            width: calc(100% - 2em);
        }
    }
}
</style>