<template>
    <div :class="sectionClass">
        <div v-for="(item, index) in content" :key="item.text">
            <buttonElement :item="item" :index="index" :length="content.length"/>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        content: Array,
        sectionClass: String
    }
}
</script>

<style scoped lang="scss">
.wrap {
    display: flex;
    flex-flow: row wrap;
}
</style>