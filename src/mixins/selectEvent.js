/**
* 拓扑点击选择事件
*/
import * as d3 from 'd3';

export default {
    data() {
        return {
            radius: 20, // 模糊点选的距离
            radius_oa: 5 // OA器件的模糊点选距离
        }
    },
    mounted() {
        let o = d3.select(this.$el);
        // 添加鼠标点击事件
        let clickEvent = null,
            vue = this;
        o.on('click', function () {
            let mp = vue.getLogicalMousePosition(this);
            let e = window.event || d3.event;
            if (clickEvent) {
                clearTimeout(clickEvent);
            }
            clickEvent = setTimeout(() => {
                vue.mouseClickHandler(mp, e);
            }, 200);
        });
        o.on('dblclick', function () {
            let mp = vue.getLogicalMousePosition(this);
            if (clickEvent) {
                clearTimeout(clickEvent);
            }
            clickEvent = setTimeout(() => {
                vue.mouseDbLClickHandler(mp);
            }, 200);
        });
    },
    methods: {
        /**
         * 获取鼠标的当前位置
         */
        getLogicalMousePosition(container) {
            let target = d3.select(container).select('#topo-zoomlayer');
            let m = d3.mouse(container);
            let sc = this.getTransform(target).scale;
            let tr = this.getTransform(target).translate;
            let mx = (m[0] - tr[0]) / sc; let my = (m[1] - tr[1]) / sc;
            return { x: mx, y: my };
        },
        /**
         * 根据鼠标当前位置找到对应的node
         * @param mouse
         */
        computeNearestNode(mouse) {
            return this.simulation.find(mouse.x, mouse.y, this.radius);
        },
        /**
         * 根据鼠标当前位置找到对应的link
         * @param mouse
         * @returns {*}
         */
        computeNearestLink(mouse) {
            let vue = this;
            let proximity = prox(this.radius); let nearest = null; let minDist;

            let links = d3.select(this.$el).selectAll('#topo-links path.link');

            // 鼠标到链路这条水平线上的垂足坐标
            function pdrop(line, mouse) {
                let x1 = line.x1;
                let y1 = line.y1;
                let x2 = line.x2;
                let y2 = line.y2;
                let x3 = mouse.x;
                let y3 = mouse.y;
                let k = ((y2 - y1) * (x3 - x1) - (x2 - x1) * (y3 - y1)) / (sq(y2 - y1) + sq(x2 - x1));
                let x4 = x3 - k * (y2 - y1);
                let y4 = y3 + k * (x2 - x1);
                return { x: x4, y: y4 };
            }

            // 判断鼠标到链路的距离是否在模糊范围内
            function lineHit(line, p, m) {
                // 判断垂足是否在链路上
                if (p.x < line.x1 && p.x < line.x2) return false;
                if (p.x > line.x1 && p.x > line.x2) return false;
                if (p.y < line.y1 && p.y < line.y2) return false;
                if (p.y > line.y1 && p.y > line.y2) return false;
                // 鼠标与垂足的距离是否小于模糊距离
                return mdist(p, m) <= proximity;
            }

            // 取平方
            function sq(x) {
                return x * x;
            }

            function mdist(p, m) {
                return Math.sqrt(sq(p.x - m.x) + sq(p.y - m.y));
            }

            function prox(dist) {
                let zoomer = d3.select(vue.$el).datum();
                return dist / zoomer.scale();
            }

            if (links.size()) {
                minDist = proximity * 2;

                links.each(function(d) {
                    // 隐藏的不判断是否被鼠标点选
                    if (d3.select(this).style('display') === 'none') {
                        return;
                    }
                    let line = d.position;
                    let point; let hit; let dist;

                    point = pdrop(line, mouse); // 垂足
                    hit = lineHit(line, point, mouse);
                    if (hit) {
                        if (line && !line.cp) {
                            // 直线
                            dist = mdist(point, mouse);
                            if (dist < minDist) {
                                minDist = dist;
                                nearest = d;
                            }
                        }
                        if (line && line.cp) {
                            // 曲线
                            let cp = line.cp;
                            // 计算该垂线与二次贝塞尔曲线的交点
                            let t = mdist(point, {x: line.x1, y: line.y1})
                                / mdist({x: line.x2, y: line.y2}, {x: line.x1, y: line.y1});
                            let bx = line.x1 * Math.pow((1 - t), 2) + 2 * t * (1 - t) * cp.x + t * t * line.x2,
                                by = line.y1 * Math.pow((1 - t), 2) + 2 * t * (1 - t) * cp.y + t * t * line.y2;
                            dist = mdist({x: bx, y: by}, mouse);
                            if (dist < minDist) {
                                minDist = dist;
                                nearest = d;
                            }
                        }
                    }
                });
            }
            return nearest;
        },
        /**
         * 根据鼠标当前位置找到对应的OA
         * @param mp 鼠标位置
         * @returns {*}
         */
        computeNearestOA(mp) {
            let oas = d3.selectAll('g.oa');
            let radius = this.radius_oa,
                min = radius,
                nest = null;
            oas.each(oa => {
                let mx = mp.x, my = mp.y;
                let x = oa.x, y = oa.y;
                let dst = Math.sqrt(Math.pow(my - y, 2) + Math.pow(mx - x, 2))
                if (dst < min) {
                    min = dst;
                    nest = oa;
                }
            })
            return nest;
        },
        /**
         * 鼠标单击事件
         * @param mp
         * @param e
         */
        mouseClickHandler(mp, e) {
            if (this.showOA) {
                // 判断鼠标是否在OA器件附近
                let oa = this.computeNearestOA(mp)
                if (oa && this._events['oa-select-event']) {
                    this.$emit('oa-select-event', oa, e);
                    return;
                }
            }
            // 节点选择的模糊监听
            let node = this.computeNearestNode(mp);
            if (node && this._events['node-select-event']) {
                this.$emit('node-select-event', node, e);
                return;
            } else {
                let link = this.computeNearestLink(mp);
                if (link && this._events['link-select-event']) {
                    this.$emit('link-select-event', link, e);
                    return;
                }
            }
            // 若无节点点击事件，则作为点击空白处理
            this.$emit('click-blank', e);
        },
        /**
         * 鼠标双击事件
         * @param mp
         */
        mouseDbLClickHandler(mp) {
            let node = this.computeNearestNode(mp);
            if (node) {
                // 清除固定
                node.isfixed = false;
                node.fx = node.fy = null;
            }
        },
        /**
         * 鼠标右键事件
         * @param {Object} e 鼠标事件
         */
        mouseRightClickHandler(e) {
            if (!this.allowRightClick) return;
            e.preventDefault();
            // 获取鼠标位置
            let target = d3.select(this.$el).select('#topo-zoomlayer');
            let sc = this.getTransform(target).scale;
            let tr = this.getTransform(target).translate;
            let mx = (e.x - tr[0]) / sc; let my = (e.y - tr[1]) / sc;
            let mp = {
                x: mx,
                y: my
            }
            // 找到右键的目标
            if (this.showOA) {
                // 判断鼠标是否在OA器件附近
                let oa = this.computeNearestOA(mp)
                if (oa && this._events['right-click-event']) {
                    this.$emit('right-click-event', {
                        type: 'oa',
                        data: oa,
                        event: e
                    });
                    return;
                }
            }
            // 寻找节点
            let node = this.computeNearestNode(mp);
            if (node && this._events['right-click-event']) {
                this.$emit('right-click-event', {
                    type: 'node',
                    data: node,
                    event: e
                });
                return;
            } else {
                // 寻找链路
                let link = this.computeNearestLink(mp);
                if (link && this._events['right-click-event']) {
                    this.$emit('right-click-event', {
                        type: 'link',
                        data: link,
                        event: e
                    });
                    return;
                }
            }
            this.$emit('right-click-event', null);
        }
    }
}
