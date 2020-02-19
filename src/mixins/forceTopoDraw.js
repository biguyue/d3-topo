/**
 * @Description：力学图的视图更新模块
 * @Author: mhcai
 * @Date: 2019/12/6 14:33
 * @LastEditTime: 2019/12/9 10:40
 * @LastEditors: mhcai
 */
/* tools */
import * as d3 from 'd3';

export default {
    data() {
        return {
            oaSize: 7 // OA器件大小
        }
    },
    computed: {
        // 是否绘制OA器件
        drawOA() {
            // return this.$store.state.topo.drawOA;
            return false;
        },
        // 是否显示OA器件
        showOA() {
            // return this.$store.state.topo.drawOA && this.$store.state.topo.showOA;
            return false;
        }
    },
    methods: {
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
            this.simulation.nodes(this.nodes).alpha(0.2).alphaTarget(this.alphaTarget).restart();
            this.listenerTickEnd();
        },
        /**
         * 添加一组节点
         * @param data
         */
        addVNodes(data) {
            let drag = this.dragEvent();
            let f = d3.select('#topo-nodes').selectAll('g.node').data(data);
            let p = f.enter().append('g').attr('class', 'node').attr('id', function (t) {
                return 'node' + t.uuid;
            })/*.classed('downNode', function (t) {
                    return t.operateStatus !== 'operate-up';
                })*/.call(drag);

            this.addNode(p);
        },
        /**
         * 添加一个节点
         * @param data
         */
        addVNode(data) {
            let drag = this.dragEvent();
            let f = d3.select('#topo-nodes');
            let p = f.append('g').attr('class', 'node')/*.classed('downNode', data.operateStatus !== 'operate-up')*/
                .attr('id', 'node' + data.uuid).datum(data).call(drag);

            this.addNode(p);
        },
        /**
         * 添加节点DOM
         * @param p
         */
        addNode(p) {
            let size = this.nodeSize
            // 设置图标
            p.append('circle').attr('r', size / 3).classed('nodeCircle', true);
            p.append('use').attr('width', size).attr('height', size)
                .attr('xlink:href', d => { return d.href }).attr('class', 'image');
            // 设置节点名称、ID、IP
            p.append('text').attr('class', 'propName name').text(function (t) {
                return t.name;
            }).style('display', this.nodeLabel !== 'name' ? 'none' : '');
            p.append('text').attr('class', 'propName ip').text(function (t) {
                return t.ip;
            }).style('display', this.nodeLabel !== 'ip' ? 'none' : '');
        },
        /**
         * 更新一个节点
         * @param data
         */
        updateVNode(data) {
            let p = d3.select('#node' + data.uuid);
            if (!p.node()) {
                console.log('Can\'t find the node which id is' + data.uuid);
                return;
            }
            /*p.classed('downNode', function (t) {
                return t.operateStatus !== 'operate-up';
            });*/
            p.selectAll('circle');
            p.selectAll('use').attr('xlink:href', data.href);
            p.select('text.propName.name').text(data.name);
            p.select('text.propName.ip').text(data.ip);
        },
        /**
         * 删除一个节点
         * @param data
         */
        deleteVNode(data) {
            let p = d3.select('#node' + data.uuid);
            if (p.node()) {
                p.remove();
            } else {
                console.log('Can\'t find the node which id is' + data.uuid);
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
            this.simulation.force('link').links(this.links);
            this.simulation.alpha(0.1).alphaTarget(0.02).restart();
            this.listenerTickEnd();
        },
        /**
         * 添加一组链路
         * @param data
         */
        addVLinks(data) {
            let f = d3.select('#topo-links').selectAll('g.link').data(data);
            let p = f.enter().append('g').attr('class', 'link').attr('id', function (t) {
                return 'link' + t.uuid;
            }).classed('downLink', function (t) {
                return t.status === 'down';
            });
            p.append('path').classed('link', true);
            // 添加OA器件
            if (this.drawOA) {
                this.addVOAs(p)
            }
        },
        /**
         * 添加一条链路
         * @param data
         */
        addVLink(data) {
            let f = d3.select('#topo-links');
            let p = f.append('g').attr('class', 'link').attr('id', 'link' + data.uuid)
                .classed('downLink', data.status === 'down').datum(data);
            p.append('path').classed('link', true);
            if (this.drawOA) {
                this.addVOAs(p)
            }
        },
        /**
         * 更新一条链路
         * @param data
         */
        updateVLink(data) {
            let p = d3.select('#link' + data.uuid);
            if (!p.node()) {
                console.log('Can\'t find the link which id is' + data.uuid);
                return;
            }

            p.classed('downLink', data.status === 'down');
            p.selectAll('path');
            if (this.drawOA) {
                // 更新链路时需考虑OA的更新，数量是否会有增减？
            }
        },
        /**
         * 删除一条链路
         * @param data
         */
        deleteVLink(data) {
            let p = d3.select('#link' + data.uuid);
            if (p.node()) {
                p.remove();
            } else {
                console.log('Can\'t find the link which id is' + data.uuid);
            }
        },
        /**
         * 添加OA器件
         * @param p
         */
        addVOAs(p) {
            let m = p.append('g').attr('class', 'oa-group').classed('hide', !this.showOA)
                .selectAll('g.oa').data(d => {
                return d.oaList
            });
            let n = m.enter().append('g').attr('class', 'oa').attr('id', t => {
                return 'oa' + t.uuid
            })
            n.append('use').attr('width', this.oaSize).attr('height', this.oaSize)
                .attr('xlink:href', '#arrow').attr('class', 'image')
        },
        /**
         * 删除OA
         * @param data
         */
        deleteVOA(data) {
            let p = d3.select('#oa' + data.uuid);
            if (p.node()) {
                p.remove();
            } else {
                console.log('Can\'t find the oa which id is' + data.uuid);
            }
        }
    },
    watch: {
        showOA(now) {
            d3.selectAll('g.oa-group').classed('hide', !now);
        }
    }
}
