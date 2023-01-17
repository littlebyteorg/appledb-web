<template>
    {{ computedProperty.infoString }}
</template>

<script>
String.prototype.format = function(vars) {
   let temp = this
   for (let item in vars)
     temp = temp.replace("${" + item + "}", vars[item])
   return temp
}

export default {
    data() {
        return {
            showAll: false
        }
    },
    props: {
        property: Object
    },
    computed: {
        computedProperty() {
            let ret = this.property
            ret.infoString = ret.string.format({i: ret.value})
            return ret
        }
    } 
}
</script>