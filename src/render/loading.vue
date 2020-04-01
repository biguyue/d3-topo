/**
* Loading动画组件
*/
<template>
    <div class="loading" :style="{background: background || ''}">
        <div class="la-ball-spin-clockwise">
            <div :style="{'background-color': color || ''}"></div>
            <div :style="{'background-color': color || ''}"></div>
            <div :style="{'background-color': color || ''}"></div>
            <div :style="{'background-color': color || ''}"></div>
            <div :style="{'background-color': color || ''}"></div>
            <div :style="{'background-color': color || ''}"></div>
            <div :style="{'background-color': color || ''}"></div>
            <div :style="{'background-color': color || ''}"></div>
        </div>
        <p class="text" :style="{color: color || ''}">
            <slot></slot>
        </p>
    </div>
</template>

<script type="text/ecmascript-6">
    export default {
        name: 'loading',
        props: {
            background: String,
            color: String
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
    @import '../style/mixins.styl';
    @import '../style/varibles.styl';

    animationDelay(time)
        -webkit-animation-delay time
        -moz-animation-delay time
        -o-animation-delay time
        animation-delay time

    .loading
        position absolute
        top 0
        bottom 0
        left 0
        right 0
        flexLayout(column)
        .text
            margin-top 30px
            text-align center
            font-size 14px
            color $font_color
        .la-ball-spin-clockwise
            position relative
            width 30px
            height @width
            color $loading_color
            font-size 36px
            -webkit-box-sizing border-box
            -moz-box-sizing border-box
            box-sizing border-box
            div
                position absolute
                display inline-block
                top 50%
                left 50%
                width 7px
                height @width
                margin-top -4px
                margin-left -4px
                border-radius 100%
                background-color currentColor
                -webkit-box-sizing border-box
                -moz-box-sizing border-box
                box-sizing border-box
                animation(ball-spin-clockwise 1s infinite ease-in-out)
                &:nth-child(1)
                    top 5%
                    animationDelay -.875s
                &:nth-child(2)
                    top 18.1801948466%
                    left 81.8198051534%
                    animationDelay -.75s
                &:nth-child(3)
                    left 95%
                    animationDelay -.625s
                &:nth-child(4)
                    top 81.8198051534%
                    left 81.8198051534%
                    animationDelay -.5s
                &:nth-child(5)
                    top 94.9999999966%
                    animationDelay -.375s
                &:nth-child(6)
                    top 81.8198046966%
                    left 18.1801949248%
                    animationDelay -.25s
                &:nth-child(7)
                    left 5.0000051215%
                    animationDelay -.125s
                &:nth-child(8)
                    top 18.179464974%
                    left 18.1803700518%
                    animationDelay 0

    @keyframes ball-spin-clockwise {
        0%,
        100% {
            opacity: 1;
            -webkit-transform: scale(1);
            -moz-transform: scale(1);
            -o-transform: scale(1);
            transform: scale(1);
        }
        20% {
            opacity: 1;
        }
        80% {
            opacity: 0;
            -webkit-transform: scale(0);
            -moz-transform: scale(0);
            -o-transform: scale(0);
            transform: scale(0);
        }
    }
</style>
