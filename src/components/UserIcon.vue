<script>
import userIconDark from "@icons/profile/user-default-dark.jpg";

export default {
    name: "UserIcon",

    props: {
        userIcon: {
            type: String,
            required: false,
            default: userIconDark,
        },

        roundBorder: {
            type: Boolean,
            required: false,
            default: false,
        },

        size: {
            type: String,
            required: false,
            default: "128px",
        },

        borderSize: {
            type: String,
            required: false,
            default: "4px",
        },
    },

    data() {
        return {
            //
        };
    },

    computed: {
        imageSrc() {
            return this.userIcon || userIconDark;
        },

        userBoxImageStyle() {
            return {
                "border-radius": this.roundBorder ? "50%" : "0%",
            };
        },
    },
};
</script>

<template>
    <div class="user-image-container">
        <div class="user-image-box" :style="userBoxImageStyle">
            <img class="user-image" :src="imageSrc" />
        </div>
    </div>
</template>

<style>
.user-image-container {
    width: v-bind(size);
    height: v-bind(size);
    display: flex;
    align-items: center;
    justify-content: center;
}

.user-image-box {
    width: calc(v-bind(size) - v-bind(borderSize) * 2);
    height: calc(v-bind(size) - v-bind(borderSize) * 2);
    outline: v-bind(borderSize) solid #eee;
    outline-offset: -1px;
    overflow: hidden;
    transition: outline var(--theme-time) ease, border-radius 0.2s ease;
}

.user-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
</style>
