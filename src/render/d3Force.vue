<!--
 * D3-Force绘制拓扑
-->
<template>
    <svg class="main" v-bind="svgStyle"></svg>
</template>

<script type="text/ecmascript-6">
    /* mixins */
    import viewUtils from '../mixins/viewUtils'
    import selectEvent from '../mixins/selectEvent'
    import drawEvent from '../mixins/forceTopoDraw'
    /* tools */
    import * as d3 from 'd3';

    export default {
        name: 'topo-d3',
        mixins: [viewUtils, selectEvent, drawEvent],
        props: {
            // 设置画布大小
            size: {
                type: Object,
                validator: val => {
                    return typeof val === 'object' && val.hasOwnProperty('width') && !isNaN(val.width) &&
                        val.hasOwnProperty('height') && !isNaN(val.height);
                }
            },
            // 待绘制的节点数据
            nodes: {
                type: Array,
                required: true
            },
            // 待绘制的链路数据
            links: {
                type: Array,
                required: true
            },
            // 节点标签显示的内容
            nodeLabel: {
                type: String,
                default: 'name',
                validator: val => {
                    return ['none', 'name', 'ip'].indexOf(val) !== -1;
                }
            }
        },
        data() {
            return {
                simulation: null, // 力学模型
                svgStyle: {},
                alphaTarget: 0.1,
                nodeSize: 45 // 节点大小
            }
        },
        mounted() {
            let width = this.size.width;
            let height = this.size.height;

            // 定义画布
            let o = d3.select(this.$el);
            this.svgStyle = {
                'width': width,
                'height': height,
                'x': 0,
                'y': 0,
                'viewBox': '0 0 ' + width + ' ' + height};
            // 为缩放区域增加id
            let s = o.append('g').attr('id', 'topo-zoomlayer').append('g').attr('id', 'topo-force');
            s.append('g').attr('id', 'topo-links');
            s.append('g').attr('id', 'topo-nodes');

            // 定义力学动作
            this.simulation = d3.forceSimulation()
                .force('charge', d3.forceManyBody().strength(-800)) // 节点多体作用力
                .force('link', d3.forceLink()
                    .distance(d => {
                        return d.hasOwnProperty('length') ? d.length : 100
                    }).strength(1).id(d => { return d.id; })) // 连线作用力
                .force('x', width / 2)
                .force('y', height / 2)
                .on('tick', () => {
                    this.tickEvent(s);
                });
            this.simulation.stop();
        },
        methods: {
            /**
             * 开始绘制拓扑
             */
            initTopo() {
                // 添加节点、链路
                if (this.nodes && this.links) {
                    // 节点
                    this.addVNodes(this.nodes);
                    // 添加力学节点
                    this.simulation.nodes(this.nodes);
                    // 链路
                    this.addVLinks(this.links);
                    // 添加力学链路
                    this.simulation.force('link').links(this.links);
                    this.$emit('draw-callback')

                    this.simulation.alpha(0.5).restart();
                    this.listenerTickEnd()
                }
            },
            /**
             * 力学事件抖动期间调整各节点、链路的坐标
             */
            tickEvent(s) {
                let nodeSize = this.nodeSize;
                // 处理节点位置
                s.selectAll('g.node').selectAll('circle.nodeCircle')
                    .attr('cx', function (t) {
                        return t.x;
                    }).attr('cy', function (t) {
                        return t.y;
                    });
                s.selectAll('g.node').selectAll('use.image')
                    .attr('x', function (t) { return t.x - nodeSize / 2 })
                    .attr('y', function (t) { return t.y - nodeSize / 2 });
                s.selectAll('g.node').selectAll('text.propName')
                    .attr('x', function (t) { return t.x })
                    .attr('y', function (t) { return t.y + nodeSize / 2 });
                // 处理链路
                s.selectAll('path.link').call(this.calcPosition)
                    .attr('d', d => {
                        let pos = d.position;
                        if (!pos.cp) {
                            // 直线
                            return 'M ' + pos.x1 + ' ' + pos.y1 + ' L ' + pos.x2 + ' ' + pos.y2;
                        } else {
                            // 曲线（二次贝塞尔曲线）
                            return 'M ' + pos.x1 + ' ' + pos.y1 + ' Q ' + pos.cp.x + ' ' + pos.cp.y + ' ' +
                                pos.x2 + ' ' + pos.y2;
                        }
                    })
                // 处理OA器件
                if (this.drawOA) {
                    let oaSize = this.oaSize
                    s.selectAll('g.link').each(function(d) {
                        let pos = d.position;
                        let x1 = pos.x1, y1 = pos.y1, x2 = pos.x2, y2 = pos.y2;
                        let oaNum = d.oaList.length;
                        if (!pos.cp) {
                            // 计算直线上的OA坐标
                            let deg = Math.atan2((y2 - y1), (x2 - x1)) * (180 / Math.PI) // 角度°
                            d3.select(this).selectAll('g.oa use.image').each(function (t, i) {
                                let voa = d3.select(this);
                                // 计算坐标
                                let x = x1 + (x2 - x1) * (i + 1) / (oaNum + 1),
                                    y = y1 + (y2 - y1) * (i + 1) / (oaNum + 1)
                                t.x = x;
                                t.y = y;
                                // 设置DOM
                                voa.attr('x', x - oaSize / 2).attr('y', y - oaSize / 2)
                                    .attr('transform', 'rotate(' + deg + ' ' + x + ' ' + y + ')')
                            })
                        } else {
                            // 计算曲线上的OA坐标
                            let cx = pos.cp.x, cy = pos.cp.y;
                            d3.select(this).selectAll('g.oa use.image').each(function (t, i) {
                                let voa = d3.select(this);
                                let r = (i + 1) / (oaNum + 1);
                                // 计算坐标
                                let x = Math.pow(1 - r, 2) * x1 + 2 * r * (1 - r) * cx + Math.pow(r, 2) * x2,
                                    y = Math.pow(1 - r, 2) * y1 + 2 * r * (1 - r) * cy + Math.pow(r, 2) * y2;
                                t.x = x;
                                t.y = y;
                                // 计算角度°
                                let k = ((-2) * (1 - r) * y1 + 2 * (1 - r) * cy - 2 * r * cy + 2 * r * y2)
                                    / ((-2) * (1 - r) * x1 + 2 * (1 - r) * cx - 2 * r * cx + 2 * r * x2);
                                let deg = Math.atan(k) * (180 / Math.PI) - (x2 > x1 ? 0 : 180)
                                // 设置DOM
                                voa.attr('x', x - oaSize / 2).attr('y', y - oaSize / 2)
                                    .attr('transform', 'rotate(' + deg + ' ' + x + ' ' + y + ')')
                            })
                        }
                    });
                }
                // 触发小地图的同步映射
                this.$emit('thumb-map')
            },
            /**
             * 对多线进行坐标处理
             */
            calcPosition(t) {
                let lines = t;
                let linksByDevice = {};

                // 遍历所有link，将相同两点之间的链路存储在数组中，并由两点的id设置一个key值
                lines.each(function(d) {
                    aggregateLink(d);
                });

                // 遍历任意两个节点之间的链路数组
                for (let key in linksByDevice) {
                    let linkArr = linksByDevice[key];

                    let numLinks = linkArr.length;
                    let index = 0; let link;

                    // 只存在一条link时，取默认坐标
                    if (numLinks === 1) {
                        link = linkArr[0];
                        link.position = getDefaultPos(link);
                    } else {
                        // 大于1条时，画曲线，对每条link坐标进行一定的偏移
                        for (index; index < numLinks; index++) {
                            link = linkArr[index];
                            let offsetAmt = amt(numLinks, index);
                            if (offsetAmt) {
                                link.position = calcMovement(link, offsetAmt);
                            } else {
                                link.position = getDefaultPos(link);
                            }
                        }
                    }
                }

                function getDefaultPos(link) {
                    // 获取链路默认坐标
                    return {
                        x1: link.source.x,
                        y1: link.source.y,
                        x2: link.target.x,
                        y2: link.target.y
                    };
                }

                function makeNodeKey(node1, node2) {
                    // 设置link存储key值
                    return node1 + '-' + node2;
                }

                function aggregateLink(link) {
                    let key = makeNodeKey(link.source.id, link.target.id);
                    let keyRev = makeNodeKey(link.target.id, link.source.id);
                    let found = findNodePair(key, keyRev);

                    if (found) {
                        linksByDevice[found].push(link);
                    } else {
                        linksByDevice[key] = [link];
                    }
                }

                function findNodePair(key, keyRev) {
                    // 查找这两点之间是否存在link
                    if (linksByDevice[key]) {
                        return key;
                    } else if (linksByDevice[keyRev]) {
                        return keyRev;
                    } else {
                        return false;
                    }
                }

                /**
                 * 计算偏移距离
                 */
                function amt(numLinks, linkIdx) {
                    let gap = 20;
                    return (linkIdx - ((numLinks - 1) / 2)) * gap;
                }

                /**
                 * 计算link偏移后的坐标
                 */
                function calcMovement(d, amt) {
                    let pos = getDefaultPos(d);
                    let ox = (pos.x2 + pos.x1) / 2,
                        oy = (pos.y2 + pos.y1) / 2;
                    let dx, dy;
                    if (pos.y2 - pos.y1 === 0) {
                        dx = 0;
                        dy = amt;
                    } else {
                        let k = (pos.x1 - pos.x2) / (pos.y2 - pos.y1); // 偏移点到中心点的斜率
                        let m = (amt / Math.abs(amt));
                        dx = m * Math.sqrt((amt * amt) / (1 + k * k));
                        dy = dx * k;
                    }

                    return {
                        x1: pos.x1,
                        y1: pos.y1,
                        x2: pos.x2,
                        y2: pos.y2,
                        cp: {x: ox + dx, y: oy + dy}
                    };
                }
            },
            /**
             * 重绘拓扑
             */
            refreshTopo() {
                // 重置画布
                let s = d3.select(this.$el).select('#topo-force');
                s.select('g#topo-links').selectAll('g').remove();
                s.select('g#topo-nodes').selectAll('g').remove();
                // 按新数据重绘
                this.simulation.stop();
                this.initTopo();
            },
            /**
             * 抖动事件结束
             */
            listenerTickEnd() {
                let inter = setInterval(() => {
                    if (this.simulation.alpha() <= this.alphaTarget) {
                        // 坐标计算的抖动已结束
                        this.$emit('tick-stop');
                        clearInterval(inter);
                    }
                }, 100);
            }
        },
        watch: {
            size(now, old) {
                let width = now.width;
                let height = now.height;
                this.svgStyle = {
                    'width': width,
                    'height': height,
                    'x': 0,
                    'y': 0,
                    'viewBox': '0 0 ' + width + ' ' + height};
                this.simulation.force('x', d3.forceX(width / 2)).force('y', d3.forceY(height / 2));
                if (now.width !== old.width || now.height !== old.height) {
                    // 尺寸改变后需要重新触发力学动作
                    this.simulation.alpha(0.5).alphaTarget(this.alphaTarget).restart();
                    this.listenerTickEnd();
                }
            },
            nodeLabel(now) {
                let nodes = d3.select(this.$el).select('g#topo-nodes').selectAll('g.node');
                if (nodes.size) {
                    nodes.each((t, i, list) => {
                        let p = d3.select(list[i]);
                        // 更新文字内容和显示状态
                        p.select('text.propName.name').text(t => {
                            return t.name;
                        }).style('display', now !== 'name' ? 'none' : '');
                        p.select('text.propName.ip').text(t => {
                            return t.ip;
                        }).style('display', now !== 'ip' ? 'none' : '');
                    });
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
    @import '../style/varibles.styl';
    @import '../style/mixins.styl';

    svg.main
        grid-background($topo_bg_line_color, $topo_bg_color)
        no-select()
        /deep/ g#topo-force
            font-size 0.14rem
            g.oa-group.hide
                opacity 0
                use.image
                    cursor default
            g.oa
                use.image
                    fill $topo_oa_color
                    cursor pointer
                &.selected
                    use.image
                        fill $confirm_color
</style>
