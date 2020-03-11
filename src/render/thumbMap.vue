<!--
 * 缩略小地图组件
-->
<template>
    <svg class="thumbMap" v-bind="thumbSize" />
</template>

<script>
import * as d3 from 'd3';

export default {
    props: {
        nodes: Array, // 拓扑节点数据
        links: Array, // 拓扑链路数据
        size: Object // 拓扑图画布的size

    },
    data() {
        return {
            thumbSize: {
                width: 200,
                height: 150
            },
            nodeSize: 10 // 节点大小
        };
    },
    mounted() {
        // 定义画布
        let o = d3.select(this.$el);
        o.append('g').attr('id', 'thumb-links');
        o.append('g').attr('id', 'thumb-nodes');
    },
    methods: {
        /**
         * 初始化构建小地图DOM树
         */
        initThumbTopo() {
            let o = d3.select(this.$el);
            o.select('g.thumb-nodes').selectAll('g').remove();
            o.select('g.thumb-links').selectAll('g').remove();
            if (this.nodes && this.links) {
                this.addVNodes(this.nodes);
                this.addVLinks(this.links);
            }
        },
        /**
         * 映射小地图各元素的坐标
         */
        mapEvent() {
            let nodeSize = this.nodeSize;
            let s = d3.select(this.$el);
            let w = this.size.width, h = this.size.height;
            let _w = this.thumbSize.width, _h = this.thumbSize.height;
            let scaleX = _w / w, scaleY = _h / h;
            // 处理节点位置
            s.selectAll('g.node').selectAll('circle.nodeCircle')
                .attr('cx', function (t) {
                    return t.x * scaleX;
                }).attr('cy', function (t) {
                    return t.y * scaleY;
                });
            s.selectAll('g.node').selectAll('use.image')
                .attr('x', function (t) { return t.x * scaleX - nodeSize / 2 })
                .attr('y', function (t) { return t.y * scaleY - nodeSize / 2 });
            // 处理链路
            s.selectAll('path.link')
                .attr('d', d => {
                    let pos = d.position;
                    let x1 = pos.x1 * scaleX, y1 = pos.y1 * scaleY, x2 = pos.x2 * scaleX, y2 = pos.y2 * scaleY;
                    if (!pos.cp) {
                        // 直线
                        return 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2;
                    } else {
                        // 曲线（二次贝塞尔曲线）
                        return 'M ' + x1 + ' ' + y1 + ' Q ' + pos.cp.x * scaleX + ' ' + pos.cp.y * scaleY + ' ' + x2 + ' ' + y2;
                    }
                })
        },
        /**
         * 更新节点视图
         * @param type
         * @param newNode
         */
        updateNode(type, newNode) {
            switch (type) {
                case 'ADD':
                    this.addVNode(newNode);
                    break;
                case 'UPDATE':
                    this.updateVNode(newNode);
                    break;
                case 'DELETE':
                    this.deleteVNode(newNode);
                    break;
                default:
                    console.log('Invalid operation!');
                    break;
            }
        },
        /**
         * 更新链路视图
         * @param type
         * @param newLink
         */
        updateLink(type, newLink) {
            switch (type) {
                case 'ADD':
                    this.addVLink(newLink);
                    break;
                case 'UPDATE':
                    this.updateVLink(newLink);
                    break;
                case 'DELETE':
                    this.deleteVLink(newLink);
                    break;
                default:
                    console.log('Invalid operation!');
                    break;
            }
        },
        /**
         * 添加一组节点
         */
        addVNodes(data) {
            let f = d3.select('#thumb-nodes').selectAll('g.node').data(data);
            let p = f.enter().append('g').attr('class', 'node').attr('id', t => 'thumbNode' + t.id)
                .classed('downNode', function (t) {
                    return t.status === 'down';
                });

            this.addNode(p);
        },
        /**
         * 添加一个节点
         */
        addVNode(data) {
            let f = d3.select('#thumb-nodes');
            let p = f.append('g').attr('class', 'node').classed('downNode', data.status === 'down')
                .attr('id', 'thumbNode' + data.id).datum(data);

            this.addNode(p);
        },
        /**
         * 设置节点DOM结构
         */
        addNode(p) {
            let size = this.nodeSize
            p.append('circle').attr('r', size / 3).classed('nodeCircle', true);
            p.append('use').attr('width', size).attr('height', size)
                .attr('xlink:href', d => { return d.href }).attr('class', 'image');
        },
        /**
         * 更新一个节点
         * @param data
         */
        updateVNode(data) {
            let p = d3.select('#thumbNode' + data.id);
            if (!p.node()) {
                console.log('Can\'t find the node which id is' + data.id);
                return;
            }
            p.classed('downNode', function (t) {
                return t.status === 'down';
            });
            p.selectAll('circle');
            p.selectAll('use').attr('xlink:href', data.href);
        },
        /**
         * 删除一个节点
         * @param data
         */
        deleteVNode(data) {
            let p = d3.select('#thumbNode' + data.id);
            if (p.node()) {
                p.remove();
            } else {
                console.log('Can\'t find the node which id is' + data.id);
            }
        },
        /**
         * 添加一组链路
         */
        addVLinks(data) {
            let f = d3.select('#thumb-links').selectAll('g.link').data(data);
            let p = f.enter().append('g').attr('class', 'link').attr('id', function (t) {
                return 'thumbLink' + t.id;
            }).classed('downLink', function (t) {
                return t.status === 'down';
            });
            p.append('path').classed('link', true);
        },
        /**
         * 添加一条链路
         * @param data 链路的数据对象
         */
        addVLink(data) {
            let f = d3.select('#thumb-links');
            let p = f.append('g').attr('class', 'link').attr('id', 'thumbLink' + data.id)
                .classed('downLink', data.status === 'down').datum(data);
            p.append('path').classed('link', true);
        },
        /**
         * 更新一条链路
         * @param data
         */
        updateVLink(data) {
            let p = d3.select('#thumbLink' + data.id);
            if (!p.node()) {
                console.log('Can\'t find the link which id is' + data.id);
                return;
            }

            p.classed('downLink', data.status === 'down');
            p.selectAll('path');
        },
        /**
         * 删除一条链路
         * @param data
         */
        deleteVLink(data) {
            let p = d3.select('#thumbLink' + data.id);
            if (p.node()) {
                p.remove();
            } else {
                console.log('Can\'t find the link which id is' + data.id);
            }
        }
    }
};
</script>

<style lang="stylus" scoped>
.thumbMap
    position absolute
    left 10px
    bottom 10px
    border 1px solid #ddd
    background #fff
</style>
