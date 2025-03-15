<template>
    <div :class="['wrapper',index == 0 ? 'first' : 'next']">
        <div class="img">
            <picture>
                <source :srcset="`https://img.appledb.dev/${card.image.type}@256/${card.image.key}/${card.image.name || '0'}.avif`" type="image/avif">
                <source :srcset="`https://img.appledb.dev/${card.image.type}@256/${card.image.key}/${card.image.name || '0'}.webp`" type="image/webp">
                <img :src="`https://img.appledb.dev/${card.image.type}@256/${card.image.key}/${card.image.name || '0'}.png`">
            </picture>
        </div>
        <div class="text">{{ card.title }}</div>
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
        index: Number
    }
}
</script>
