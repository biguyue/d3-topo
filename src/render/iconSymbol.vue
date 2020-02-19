/**
* svg图标
* Created by mhcai on 2019/3/29 16:36.
*/
<template>
    <svg class="topo-icon" width="0" height="0">
        <defs id="iconSymbol"></defs>
    </svg>
</template>

<script type="text/ecmascript-6">
    import * as d3 from 'd3'

    export default {
        name: 'icon',
        mounted() {
            let icon = d3.select(this.$el).select('#iconSymbol');

            // NE图标
            let ne = icon.append('symbol').attr('id', 'NE').attr('viewBox', '0 0 1000 1000');
            ne.append('path').attr('d', 'M140,500.4c0,198.5,160.9,359.4,359.4,359.4c198.5,0,359.4-160.9,359.4-' +
                '359.4c0-198.5-160.9-359.4-359.4-359.4   C300.9,141,140,301.9,140,500.4L140,500.4z M140,500.4')
                .style('opacity', 0.2)
            ne.append('path').attr('d', 'M225.8,500.4c0,151.1,122.5,273.5,273.5,273.5c151.1,0,273.5-' +
                '122.5,273.5-273.5   c0-151.1-122.5-273.5-273.5-273.5C348.3,226.8,225.8,349.3,225.8,500.4L225.8,' +
                '500.4z M225.8,500.4')
            ne.append('path').classed('arrow', true).attr('d', 'M509.9,447.8h-20.2l0.9,16.5H509L509.9,447.8z M499.8,' +
                '294l-49.4,46.6h33.4l5.5,98.9h21l5.5-98.9h33.4   L499.8,294z M549.4,511.8v-20.2l-16.5,0.9v18.3L549.4,' +
                '511.8z M703.3,501.7l-46.6-49.4v33.4l-98.9,5.5v21l98.9,5.5v33.4L703.3,501.7   z M703.3,501.7')
            ne.append('path').classed('arrow', true).attr('d', 'M489.5,552.6h20.1l-0.9-16.5h-18.3L489.5,552.6z ' +
                'M499.5,706.4l49.4-46.6h-33.4l-5.5-98.9h-21l-5.5,98.9H450   L499.5,706.4z M499.5,706.4')
            ne.append('path').classed('arrow', true).attr('d', 'M447.8,490.8v20.2l16.5-0.9v-18.3L447.8,490.8z ' +
                'M294,500.8l46.6,49.4v-33.4l98.9-5.5v-21l-98.9-5.5v-33.4   L294,500.8z M294,500.8')
            // 三角形
            icon.append('symbol').attr('id', 'arrow').attr('viewBox', '0 0 1024 1024')
                .append('path')
                .attr('d', 'M279.07831111 877.78822533L279.07831111 167.20193895a28.25055836 28.25055836 0 0 1 ' +
                    '46.33091529-21.69642846l426.35742188 355.30726831a28.25055836 28.25055836 0 0 1 1e-8 ' +
                    '43.3928577L325.40922641 899.48465381A28.25055836 28.25055836 0 0 1 279.07831111 877.78822533z')
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
    .topo-icon
        /deep/ #iconSymbol
            symbol#NE
                path.arrow
                    fill #fff
</style>
