<template>
    <div class="wrapper">
        <div class="img">
            <picture>
                <source :srcset="`https://img.appledb.dev/${card.image.type}@256/${card.image.key}/0.avif`" type="image/avif">
                <source :srcset="`https://img.appledb.dev/${card.image.type}@256/${card.image.key}/0.webp`" type="image/webp">
                <img :src="`https://img.appledb.dev/${card.image.type}@256/${card.image.key}/0.png`">
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
    width: 8em;
    padding-block: 1.5em;
    border-radius: 1em;
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

    text-align: center;
}
</style>

<script>
export default {
    props: {
        card: Object
    }
}
</script>
