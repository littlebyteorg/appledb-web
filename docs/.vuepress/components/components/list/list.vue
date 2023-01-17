<template>
    <ul :class="sectionClass">
        <li v-for="item in content" :key="item.text">
            <listItem :item="item" :customListDisc="sectionClass.split(' ').includes('customListDisc')"/>
        </li>
    </ul>
</template>

<script>
export default {
    props: {
        content: Array,
        sectionClass: String
    }
}
</script>

<style scoped>
.noListDisc {
    list-style-type: none;
}

.noPadding {
    padding-left: 0;
}
</style>