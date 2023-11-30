<template>
    <div class="wrapper">
        <div class="img">
            <picture v-for="i in Math.min(3, recentDevice.image.count)" :key="i">
                <source :srcset="`https://img.appledb.dev/${recentDevice.image.type}@256/${recentDevice.image.key}/${i-1}.avif`" type="image/avif">
                <source :srcset="`https://img.appledb.dev/${recentDevice.image.type}@256/${recentDevice.image.key}/${i-1}.webp`" type="image/webp">
                <img :src="`https://img.appledb.dev/${recentDevice.image.type}@256/${recentDevice.image.key}/${i-1}.png`">
            </picture>
        </div>
        <div class="text">
            <h1>{{ recentDevice.name }}</h1>
        </div>
        <div class="subtext">
            Released on Sep 22, 2023
        </div>
    </div>
</template>

<style lang="scss" scoped>
.wrapper {
    display: flex;
    flex-direction: column;
    gap: 0;
    min-width: 16em;
    max-width: 16em;
    padding: 1.7em;
    border-radius: 1em;

    background: var(--c-container-bg);
    box-shadow: 2px 4px 12px rgba(0,0,0,.08);
    transition: all .2s cubic-bezier(0,0,.5,1);

    &:hover {
        box-shadow: 2px 4px 16px rgba(0,0,0,.16);
        transform: scale(1.02);
    }
}

.text {
    h1 {
        margin-block: 0;
        padding-block: 0;
        font-size: 1.6em;
    }

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-top: 1em;
}

.subtext {
    margin-top: 1em;
}

.img {
    img {
        max-height: 8em;
        padding-block: 1em;
    }

    picture {
        margin-right: .5em;

        &:last-of-type {
            margin-right: 0;
        }
    }

    text-align: center;
}
</style>

<script>
export default {
    props: {
        recentDevice: Object
    }
}
</script>
