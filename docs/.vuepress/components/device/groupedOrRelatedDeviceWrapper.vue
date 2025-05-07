<template>
    <template v-if="groupedOrRelatedDevicesObj.devices.length > 1">
        <h5>{{ groupedOrRelatedDevicesObj.header }}</h5>
        <div class="groupedOrRelatedDevicesWrapper">
            <groupedOrRelatedDevice
                v-for="dev in groupedOrRelatedDevicesObj.devices"
                :key="dev.url"
                :device="dev"
                :color="color"
            />
        </div>
    </template>
</template>

<script>
export default {
    data() {
        return {
            groupedHeaderStr: 'Grouped devices'
        }
    },
    props: {
        device: Array,
        img: Object,
        color: String
    },
    computed: {
        groupedOrRelatedDevicesObj() {
            const dev = this.device
            return {
                header: this.groupedHeaderStr,
                devices: this.device.map(x => {
                    return {
                        name: x.name,
                        identifier: x.identifier,
                        key: x.key,
                        released: x.released,
                        imgKey: x.subgroup ? x.deviceKeys[0] : x.key,
                        imgNames: x.img.images,
                        url: [
                            '/device',
                            x.subgroup ? '' : 'identifier',
                            x.key.replace(/ /g,'-')
                        ].filter(x => x).join('/') + '.html' + (this.color ? `?color=${this.color}` : '')
                    }
                })
            }
        }
    }
}
</script>

<style>
.groupedOrRelatedDevicesWrapper {
    display: grid;
    grid-template-columns: 50% 50%;
}

@media screen and (max-width: 575px) {
    .groupedOrRelatedDevicesWrapper {
        grid-template-columns: 100%;
    }
}
</style>