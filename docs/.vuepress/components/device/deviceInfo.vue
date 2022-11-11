<template>
    <div class="flexWrapper" :style="(wrapImg) ? 'flex-direction: column;' : 'flex-direction: row;'">
        <ul class="infoList" id="flexInfo">
            <li v-for="(s, index) in infoArr" :key="s">
                <template v-if="(infoArr[index].split(', ').length > 5 && !options.showAll[index])">
                    {{ s.replace(infoArr[index], infoArr[index].split(', ').slice(0, 3).join(', ')) }}, <a style="user-select: none; cursor: pointer;" v-on:click="options.showAll[index] = true">...</a>
                </template>
                <template v-else v-once>{{ s }}</template>
            </li>
        </ul>
        <div v-if="img.count > 0" :style="{'padding-top': wrapImg ? '1em' : 0}" class="devFlexImgWrapper">
            <template
                v-for="i in Math.min(img.count,3)"
                :key="i"
            >
                <picture
                    v-for="url in [`https://img.appledb.dev/device@main/${img.key}/${i-1}${isDarkMode && img.dark ? '_dark' : ''}`]"
                    :key="url"
                >
                    <source :srcset="url + '.avif'" type="image/avif">
                    <source :srcset="url + '.webp'" type="image/webp">
                    <img
                        :src="url + '.png'"
                        :class="`flexImg flexImg${i}`"
                        style="margin-left: .5em; max-height: 8em;"
                    >
                </picture>
            </template>
        </div>
    </div>
</template>

<script>
import { useDarkMode } from '@vuepress/theme-default/lib/client/composables'

export default {
    props: {
        infoArr: Object,
        options: Object,
        img: Object
    },
    data() {
        return {
            wrapImg: false,
            isDarkMode: useDarkMode()
        }
    },
    methods: {
        checkWrap() {
            const flexImgs = document.getElementsByClassName('flexImg')
            const flexInfoWidth = document.getElementById('flexInfo').getBoundingClientRect().width

            const element = document.getElementsByClassName('home')[0] || document.getElementsByClassName('theme-default-content')[0]
            var totalWidth = element.clientWidth - parseFloat(window.getComputedStyle(element).paddingLeft) - parseFloat(window.getComputedStyle(element).paddingRight)
            let flexImgWidth = 0

            const flexImgsLength = flexImgs.length
            let counter = 0

            for (let i = 0; i < flexImgsLength; i++) {
                flexImgs[i].onload = () => {
                    if (counter >= flexImgsLength) return
                    flexImgWidth += flexImgs[i].clientWidth
                    this.wrapImg = totalWidth < flexInfoWidth + flexImgWidth + 10
                    counter++
                }
            }

            window.onresize = () => {
                totalWidth = totalWidth = element.clientWidth - parseFloat(window.getComputedStyle(element).paddingLeft) - parseFloat(window.getComputedStyle(element).paddingRight)
                this.wrapImg = totalWidth < flexInfoWidth + flexImgWidth + 10
            }
        }
    },
    mounted() {
        this.checkWrap()
    }
}
</script>

<style lang="scss" scoped>
.devFlexImgWrapper {
    overflow: hidden;
    user-select: none;
    text-align: center;
    padding-bottom: 1em;
    margin-bottom: 1em;
    max-height: 7em;
}

.flexImg0 {
    margin-left: 0 !important;
    max-width: 100%;
}

.flexWrapper {
    display: flex;
    justify-content: space-between;
    img {
        align-self: center;
        margin-right: 0;
        margin-left: 0;
    }
}

.infoList {
    list-style-type: none;
    padding-left: 0;
    margin-top: 0;
}
</style>