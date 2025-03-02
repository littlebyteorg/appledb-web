<template>
    <div class="wrapper">
        <div class="titleWrapper">
            <h1><span class="colourText">AppleDB</span></h1>
            <p>a database of Apple software and devices</p>
        </div>
        <div class="listWrapper">
            <a href="/device-selection/">
                <div class="listItem">
                    <div class="listImg">
                        <picture>
                            <source srcset="https://img.appledb.dev/device@64/iPod%20classic/0.avif" type="image/avif">
                            <source srcset="https://img.appledb.dev/device@64/iPod%20classic/0.webp" type="image/webp">
                            <img src="https://img.appledb.dev/device@64/iPod%20classic/0.png">
                        </picture>
                    </div>
                    <div class="listText">
                        Devices <i class="fas fa-chevron-right"></i>
                        <div class="subtext">{{ deviceCount || "1,700+" }} products</div>
                    </div>
                </div>
            </a>
            <a href="/firmware.html">
                <div class="listItem">
                    <div class="listImg">
                        <picture>
                            <source srcset="https://img.appledb.dev/images@64/Sequoia/0.avif" type="image/avif">
                            <source srcset="https://img.appledb.dev/images@64/Sequoia/0.webp" type="image/webp">
                            <img src="https://img.appledb.dev/images@64/Sequoia/0.png">
                        </picture>
                    </div>
                    <div class="listText">
                        Firmware <i class="fas fa-chevron-right"></i>
                        <div class="subtext">{{ softwareCount || "10,000+" }} firmware versions</div>
                    </div>
                </div>
            </a>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            softwareCount: "",
            deviceCount: ""
        }
    },
    created() {
        fetch("https://api.appledb.dev/appledb-web/homePage.json")
            .then(response => response.json())
            .then(data => {
                this.softwareCount = data.softwareCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                this.deviceCount = data.deviceCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        })
    }
}
</script>

<style lang="scss" scoped>
.fas {
    font-size: .7em;
    margin-left: .2em;
    vertical-align: middle;
    padding-bottom: 3px;
}

.wrapper {
    margin-block: 1em;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}

.titleWrapper {
    margin-block: 1em;
    flex-grow: 1;
    
    h1 {
        font-size: 4em;
        padding-block: 0;
        margin-block: 0;
        margin-bottom: -.2em;
    }
    
    p {
        margin-block: 0;
        font-size: 1.5em;
        font-weight: 500;
        color: var(--c-text-lightest);
    }
}

a {
    color: var(--c-text);
    &:hover { text-decoration: none; }
}

.listWrapper {
    margin-block: 1em;
    font-weight: 500;
    font-size: 1em;
    display: flex;
    flex-flow: column wrap;
    
    .listItem {
        display: flex;
        flex-direction: row;
        margin-bottom: .5em;
        padding: 1em;
        border-radius: 1em;
        transition: all .2s cubic-bezier(0,0,.5,1);

        &:hover {
            background: var(--c-container-bg);
            box-shadow: 2px 4px 12px rgba(0,0,0,.08);
            transform: scale(1.01);
        }

        .listImg {
            width: 2.5em;
            text-align: center;
            margin-right: 1em;
        }
    }

    .subtext {
        color: var(--c-text-lighter);
        font-size: .8em;
        margin-top: .3em;
        font-weight: 400;
    }

    img {
        max-width: 2.5em;
        max-height: 2.5em;
    }
}

@media only screen and (max-width: 800px) {
    .wrapper {
        flex-direction: column;
    }

    .listWrapper {
        flex-direction: row;

        .listItem {
            margin-right: 1em;
        }
    }
}

@media only screen and (max-width: 550px) {

    .listWrapper {
        flex-direction: column;

        .listItem {
            margin-right: 0em;
        }
    }
}

.colourText {
    background: linear-gradient(315deg, #1bcbf0, #d96cd5);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

html.dark {
    .colourText {
        background: linear-gradient(315deg, hsl(266, 85%, 60%) 0%, hsl(251, 60%, 75%) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
}
</style>