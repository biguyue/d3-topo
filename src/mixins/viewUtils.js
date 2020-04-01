/**
* 视图交互事件，包含平移、缩放、重置和节点拖拽功能
*/
import * as d3 from 'd3';

export default {
    data() {
        return {
            isNodeLock: false // 是否禁用拖拽
        }
    },
    mounted() {
        let o = d3.select(this.$el);
        this.$nextTick(() => {
            // 添加缩放事件
            let target = o.select('#topo-zoomlayer');
            this.createZoom(o, target);
        });
    },
    methods: {
        /**
         * 获取DOM模块的缩放数据
         * @param node
         * @returns {{translate: [number,number], scale: number}}
         */
        getTransform(node) {
            let transform = node.attr('transform');
            let scale = 1;
            let translate = [0, 0];
            if (transform) {
                let scaleStr = transform.split('scale(')[1];
                scale = scaleStr ? parseFloat(scaleStr.split(')')[0]) : 1;
                let translateStr = transform.split(')')[0].split('translate(')[1];
                let str = translateStr ? translateStr.split(/[,|\s]/) : [0, 0];
                translate = [parseFloat(str[0]) || 0, parseFloat(str[1]) || 0];
            }
            return {translate: translate, scale: scale};
        },
        /**
         * 拓扑缩放
         * @param node 触发缩放的区域
         * @param target 要缩放的对象，若无，则默认为触发的区域
         */
        createZoom(node, target) {
            target = target || node;
            let vue = this;

            let zoom = d3.zoom().scaleExtent([0.3, 10])
                .on('start', () => {
                    node.classed('zoom', true);
                })
                .on('zoom', () => {
                    target.attr('transform', d3.event.transform);
                })
                .on('end', () => {
                    node.classed('zoom', false);
                    let transform = this.getTransform(target);
                    zoomer.panZoom(transform.translate, transform.scale);
                });
            node.call(zoom);
            // 鼠标双击空白处，则重置缩放、平移效果
            node.on('dblclick.zoom', function () {
                let mp = vue.getLogicalMousePosition(this);
                let node = vue.computeNearestNode(mp);
                if (!node) {
                    zoomer.reset();
                }
            });

            let n = node.node();
            let zoomer = {
                panZoom: function (translate, scale) {
                    let transform = d3.zoomTransform(n);
                    transform.constructor(scale, translate[0], translate[1]);
                    target.attr('transform', 'translate(' + translate + ')scale(' + scale + ')');
                },
                reset: function () {
                    zoomer.panZoom([0, 0], 1);
                },
                translate: function () {
                    let transform = d3.zoomTransform(n);
                    return [ transform.x, transform.y ];
                },
                scale: function () {
                    return d3.zoomTransform(n).k;
                },
                transform: function () {
                    return d3.zoomTransform(n);
                }
            };
            node.datum(zoomer);
        },
        /**
         * 是否可以拖拽
         * @returns {boolean}
         */
        dragEnabled() {
            let e = window.event || d3.event;
            return e.button === 0 && !this.isNodeLock;
        },
        /**
         * 拖拽事件
         */
        dragEvent() {
            let draggedThreshold = d3.scaleLinear()
                .domain([0, 0.1])
                .range([5, 20])
                .clamp(true);
            let drag = d3.drag()
                .subject(dragSubject)
                .on('start', dragStarted)
                .on('drag', dragged)
                .on('end', dragEnded);
            let force = this.simulation;
            let vue = this;

            function isDragged(d) {
                let threshold = draggedThreshold(force.alpha());
                let dx = d.oldX - d.fx;
                let dy = d.oldY - d.fy;
                if (Math.abs(dx) >= threshold || Math.abs(dy) >= threshold) {
                    d.dragged = true;
                }
                return d.dragged;
            }

            function dragSubject() {
                return force.find(d3.event.x, d3.event.y);
            }

            function dragStarted(d) {
                if (vue.dragEnabled()) {
                    d3.event.sourceEvent.stopPropagation();
                    d.oldX = d.x;
                    d.oldY = d.y;
                    d.dragged = false;
                    d.dragStarted = true;
                    if (!d3.event.active) {
                        force.alphaTarget(vue.alphaMin + 0.1).restart();
                        d.fx = d.x;
                        d.fy = d.y;
                    }
                }
            }

            function dragged(d) {
                if (vue.dragEnabled()) {
                    // v4通过fx、fy属性固定节点
                    d.fx = d3.event.x;
                    d.fy = d3.event.y;
                }
            }

            function dragEnded(d) {
                if (vue.dragEnabled()) {
                    d3.event.sourceEvent.preventDefault();

                    if (d.dragStarted) {
                        d.dragStarted = false;

                        if (isDragged(d) && vue.dragEnabled()) {
                            d.isfixed = true;
                            vue.atDragEnd(d);
                        } else {
                            // 未拖拽
                            if (!d.isfixed) {
                                d.fx = d.fy = null;
                            }
                        }
                        if (!d3.event.active) {
                            force.alphaTarget(0);
                        }
                    }
                }
            }
            return drag;
        },
        /**
         * 拖拽结束后固定节点位置
         * @param d
         */
        atDragEnd(d) {
            d3.select('#node' + d.id).classed('fixed', d.isfixed);
            this.$emit('drag-end', d);
        }
    }
}
