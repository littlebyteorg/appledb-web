<template>
    <div class="wrapper">
        <div class="img">
            <picture>
                <source :srcset="`https://img.appledb.dev/${deviceTypeImage.type}@256/${deviceTypeImage.key}/0.avif`" type="image/avif">
                <source :srcset="`https://img.appledb.dev/${deviceTypeImage.type}@256/${deviceTypeImage.key}/0.webp`" type="image/webp">
                <img :src="`https://img.appledb.dev/${deviceTypeImage.type}@256/${deviceTypeImage.key}/0.png`">
            </picture>
        </div>
        <div class="text">{{ deviceTypeName }}</div>
    </div>
</template>

<style lang="scss" scoped>
.wrapper {
    display: flex;
    flex-direction: column;
    gap: 0;
    min-width: 8em;
    padding: 1.5em;
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
        deviceTypeName: String,
        deviceTypeImage: Object
    }
}
</script>
