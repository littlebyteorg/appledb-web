<template>
    <div :class="['wrapper',index == 0 ? 'first' : 'next']">
        <router-link :to="card.link">
            <div class="img">
                <picture>
                    <source :srcset="`https://img.appledb.dev/${card.image.type}@256/${card.image.key}/0.avif`" type="image/avif">
                    <source :srcset="`https://img.appledb.dev/${card.image.type}@256/${card.image.key}/0.webp`" type="image/webp">
                    <img :src="`https://img.appledb.dev/${card.image.type}@256/${card.image.key}/0.png`">
                </picture>
            </div>
            <h2 class="osNameText">{{ card.title }}</h2>
        </router-link>
        <div class="osVersionWrapper">
            <div class="osVersionText" v-for="(version, index) in latestVersion.sort((a, b) => (a.beta || a.rc) > (b.beta || b.rc))" :key="index">
                <router-link :to="`/firmware/${version.osStr.replace(/ /g,'-')}/${version.uniqueBuild}.html`">
                     <div :class="version.replaced && 'faded'">{{ version.version }}
                        <div class="tag" style="color: #ab47bc;" v-if="version.beta">beta</div>
                        <div class="tag" style="color: #ab47bc;" v-else-if="version.rc">rc</div>
                        <div class="tag" style="color: #f0ad05;" v-else-if="version.internal">internal</div>
                        <div class="tag" style="color: #039be5;" v-else>release</div>
                    
                        <div class="osVersionReleasedText">{{ version.released }}</div>
                    </div>
                </router-link>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.wrapper {
    display: flex;
    flex-direction: row;
    gap: 0;
    margin-inline: -2em;
    padding: 2em;
    border-radius: 1em;
    transition: all .2s cubic-bezier(0,0,.5,1);

    h2 {
        border-bottom: none;
    }
}

@media screen and (min-width: 801px) {
    .wrapper {
        width: 80%;
    }
}

.osNameText {
    text-align: center;
    font-weight: 600;
    font-size: 1.5em;
}

.osVersionWrapper {
    margin-left: 2em;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
}

.osVersionReleasedText {
    font-size: .9em;
    color: var(--c-text-lighter);
}

a {
    color: var(--c-text);

    &:hover {
        text-decoration: none;
    }
}

.faded {
    color: var(--c-text-lighter);
}

.text {
    text-align: center;
    font-weight: 600;
    margin-top: .8em;
}

.img {
    img {
        max-height: 5em;
    }
    height: 5em;

    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
}

.tag {
    display: inline-block;
    border-radius: 4em;
    border: 1px solid;
    padding: 5px 9px;
    margin-block: 6px 5px;
    margin-left: 4px;
    text-transform: uppercase;
    font-weight: 700;
    line-height: 1em;
    font-size: .5em;
    letter-spacing: .5px;
    bottom: 2px;
    position: relative;
}

.wrapper:hover {
    background: var(--c-container-bg);
    box-shadow: 2px 4px 12px rgba(0,0,0,.08);
    transform: scale(1.02);
}
</style>

<script>
export default {
    props: {
        card: Object,
        index: Number,
        latestVersion: Object
    }
}
</script>
