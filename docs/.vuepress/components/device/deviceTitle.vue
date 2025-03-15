<template>
    <div class="header" :style="{
        'flex-direction': wrapImg ? 'column-reverse' : 'row'
    }">
        <div v-if="imgUrlArr.length" :class="wrapImg ? 'imgWrap' : ''"><picture v-for="(url, index) in imgUrlArr.slice(0,3)" :key="url">
            <source :srcset="url + '.avif'" type="image/avif">
            <source :srcset="url + '.webp'" type="image/webp">
            <img :src="url + '.png'" :class="`flexImg flexImg${index}`">
        </picture></div>
        <div class="title" id="flexInfo" :class="wrapImg || imgUrlArr.length < 1 ? '' : 'titleWidth'">
            <h1>{{ title }}</h1>
            <div><template v-if="grabInfo('released')[0]">{{ grabInfo('released')[0] }} — </template><router-link :to="`/device-selection/${grabInfo('type')[0].replace(/ /g,'-')}.html`">
                    {{ grabInfo('type')[0] }}
                </router-link><template v-if="grabInfo('appLink')[0]"> — <a :href="grabInfo('appLink')[0]"><i class="fas fa-download" style="margin-right: 0.5em;"></i></a></template></div>
        </div>
    </div>
</template>

<script>
import { useDarkMode } from '@vuepress/theme-default/lib/client/composables'
export default {
    props: {
        device: Array,
        title: String,
        img: Object,
    },
    data() {
        return {
            wrapImg: false,
            isDarkMode: useDarkMode()
        }
    },
    computed: {
        imgUrlArr() {
            let retArr = []
            for (let i = 0; i < this.img.count; i++) {
                retArr.push(`https://img.appledb.dev/device@main/${this.img.key}/${this.img.names[i]}${this.isDarkMode && this.img.dark ? '_dark' : ''}`)
            }
            return retArr
        }
    },
    methods: {
        grabInfo(property) {
            if (property == 'released') {
                const dateArr = Array.from(new Set(this.device.map(x => x[property]).flat())).filter(x => x).sort().map(x => {
                    const dateOffset = (new Date().getTimezoneOffset() * 60 * 1000) + (60 * 60000)
                    const currentDate = new Date(x).valueOf()
                    const adjustedDate = new Date(currentDate + dateOffset)

                    const releasedArr = x.split('-')
                    const dateStyleArr = [{ year: 'numeric' }, { year: 'numeric', month: 'short' }, { dateStyle: 'medium' }]
                    const date = new Intl.DateTimeFormat('en-US', dateStyleArr[releasedArr.length-1]).format(adjustedDate)
                    
                    return date
                })
                return dateArr
            }

            return Array.from(new Set(this.device.map(x => x[property]).flat())).sort()
        },
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
                    this.wrapImg = totalWidth < flexInfoWidth + flexImgWidth + 100
                    counter++
                }
            }

            window.onresize = () => {
                totalWidth = totalWidth = element.clientWidth - parseFloat(window.getComputedStyle(element).paddingLeft) - parseFloat(window.getComputedStyle(element).paddingRight)
                this.wrapImg = totalWidth < flexInfoWidth + flexImgWidth + 100
            }
        }
    },
    mounted() {
        this.checkWrap()
    }
}
</script>

<style lang="scss" scoped>
.header {
    display: flex;
    flex-wrap: wrap;
    margin-block: 2em 1em;

    .titleWidth {
        max-width: 60%;
    }

    h1 {
        margin: 0;
        padding: 0;
        margin-bottom: .3em;
    }

    .imgWrap {
        margin-top: 2em;
        margin-inline: auto;
    }

    picture {
        img {
            max-height: 8em;
        }

        margin-inline: .2em;

        &:last-of-type {
            margin-right: 2em;
        }
    }

    .devType {
        margin-top: .5em;
    }
}
</style>