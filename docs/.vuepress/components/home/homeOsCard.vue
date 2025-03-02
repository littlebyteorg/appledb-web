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
        <div class="osVersionText" v-for="(version, index) in latestVersion">
            <router-link :to="`/firmware/${version.osStr.replace(/ /g,'-')}/${version.uniqueBuild}.html`">
                <div :class="version.replaced && 'faded'">{{ version.version }}
                    <div class="tag" style="color: #ab47bc;" v-if="version.beta">beta</div>
                    <div class="tag" style="color: #ab47bc;" v-else-if="version.rc">rc</div>
                    <div class="tag" style="color: #f0ad05;" v-else-if="version.internal">internal</div>
                    <div class="tag" style="color: #039be5;" v-else>release</div>
                
                    <div>{{ version.released }}</div>
                </div>
            </router-link>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.wrapper {
    position: static;
    display: flex;
    flex-direction: column;
    gap: 0;
    padding-block: 1.5em;
    border-radius: 1em;
    transition: all .2s cubic-bezier(0,0,.5,1);
    width: 10em;
    margin-inline: -.5em;
}

.osNameText {
    text-align: center;
    font-weight: 600;
    font-size: 1.5em;
}

.osVersionText {
    text-align: center;
    margin-top: .8em;
}
a {
    color: var(--c-text);

    &:hover {
        text-decoration: none;
    }
}

.faded {
    color: gray;
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
    margin-top: 6px;
    margin-bottom: 5px;
    text-transform: uppercase;
    font-weight: 700;
    line-height: 1em;
    font-size: .5em;
    letter-spacing: .5px;
    bottom: 2px;
    position: relative;
}

@media screen and (min-width: 801px) {
    .wrapper:hover {
        background: var(--c-container-bg);
        box-shadow: 2px 4px 12px rgba(0,0,0,.08);
        transform: scale(1.02);
    }
}

@media screen and (max-width: 800px) {
    .wrapper {
        width: 8em;
        margin-inline: 0em;
    }
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
