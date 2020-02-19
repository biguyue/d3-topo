<!--
 * 功能说明：拓扑绘图模块，包含d3绘图、视图交互、工具栏快捷键等
 * Created by mhcai on 2019/11/22 9:54.
-->
<template>
    <div class="topology-draw">
        <!-- svg图标 -->
        <icon></icon>
        <!-- 拓扑绘制模块 -->
        <topo-d3 ref="topo" :size="size" :nodes="nodes" :links="links" :nodeLabel="nodeLabel"
                 @click-blank="clickBlankEvent"
                 @node-select-event="nodeSelectEvent"
                 @link-select-event="linkSelectEvent"
                 @oa-select-event="oaSelectEvent"
                 @draw-callback="drawCallback"
                 @tick-stop="tickStop"></topo-d3>
        <p class="noData" v-if="noData">暂无数据</p>
        <!-- 遮罩层 -->
        <loading v-if="loading">Loading...</loading>
        <!-- 工具栏 -->
        <toolbar :toolbarRender="toolbarRender"></toolbar>
    </div>
</template>

<script type="text/ecmascript-6">
    /* components */
    import icon from './render/iconSymbol.vue'
    import topoD3 from './render/d3Force.vue'
    import toolbar from './render/toolbar.vue'
    import loading from './render/loading'
    /* mixins */
    // import keyAction from './mixins/keyAction'

    export default {
        name: 'topo-module',
        components: {
            icon,
            topoD3,
            toolbar,
            loading
        },
        // mixins: [keyAction],
        props: {
            // 是否显示遮罩层，初始默认不显示
            loading: {
                type: Boolean,
                default: false
            },
            // 拓扑数据
            topoData: {
                type: Object,
                required: true,
                validator: val => {
                    if (typeof val !== 'object' || !val.hasOwnProperty('nodes') || !Array.isArray(val.nodes)
                        || !val.hasOwnProperty('links') || !Array.isArray(val.links)) {
                        console.error('拓扑数据结构不正确，请传入{nodes: Array, links: Array}格式数据');
                        return false;
                    }
                    return true;
                }
            },
            // 节点标签显示类型
            nodeLabel: {
                type: String,
                default: 'name'
            },
            // 自定义工具栏的内容
            toolbarRender: Array
        },
        data() {
            return {
                size: {
                    width: 0,
                    height: 0
                }, // 画布大小
                nodes: [], // 节点数据
                links: [] // 链路数据
            }
        },
        computed: {
            noData() {
                return !this.loading && !this.nodes.length;
            },
            nodeSelectEvent() {
                return this._events['node-select']
            },
            linkSelectEvent() {
                return this._events['link-select']
            },
            oaSelectEvent() {
                return this._events['oa-select']
            },
            clickBlankEvent() {
                return this._events['click-blank']
            },
            // 完成DOM树的绘制
            drawCallback() {
                return this._events['draw-callback']
            },
            // 力学抖动事件结束
            tickStop() {
                return this._events['tick-stop']
            }
        },
        mounted() {
            let width = this.$el.clientWidth,
                height = this.$el.clientHeight;
            this.size = {
                width: width,
                height: height
            };
            window.addEventListener('resize', this.onResize);
        },
        methods: {
            onResize() {
                let width = this.$el.clientWidth,
                    height = this.$el.clientHeight;
                this.size = {
                    width: width,
                    height: height
                }
            },
            /**
             * 刷新拓扑
             */
            refreshTopo() {
                let topo = this.$refs.topo;
                if (topo && typeof topo.refreshTopo === 'function') {
                    if (!this.topoData || typeof this.topoData !== 'object'
                        || !Array.isArray(this.topoData.nodes) || !Array.isArray(this.topoData.links)) {
                        console.error('Topology data is invalid, can\'t to redraw.');
                        return;
                    }
                    this.nodes = this.topoData.nodes;
                    this.links = this.topoData.links;
                    setTimeout(() => {
                        topo.refreshTopo();
                    });
                }
            },
            /**
             * 更新拓扑图中的网元数据和DOM
             * @param type 操作类型，ADD/UPDATE/DELETE
             * @param newNode 待更新的网元数据
             */
            updateNode(type, newNode) {
                // 更新视图数据
                let nodes = this.nodes;
                newNode.href = newNode.href || '#NE';
                let topoVue = this.$refs.topo;
                switch (type) {
                    case 'ADD':
                        nodes.push(newNode);
                        break;
                    case 'UPDATE':
                        for (let i in nodes) {
                            let node = nodes[i];
                            if (node.uuid === newNode.uuid) {
                                this.$set(nodes, i, newNode);
                                break;
                            }
                        }
                        break;
                    case 'DELETE':
                        for (let i in nodes) {
                            let node = nodes[i];
                            if (node.uuid === newNode.uuid) {
                                nodes.splice(i, 1);
                                break;
                            }
                        }
                        // 节点的边需要删除
                        let links = this.links;
                        for (let i = 0; i < links.length; i++) {
                            let link = links[i];
                            if (link.source.uuid === newNode.uuid || link.target.uuid === newNode.uuid) {
                                links.splice(i, 1);
                                if (topoVue) {
                                    topoVue.updateLink('DELETE', link);
                                }
                                --i;
                            }
                        }
                        break;
                    default:
                        console.log('Invalid operation!');
                        break;
                }
                // 更新视图DOM
                if (topoVue) {
                    topoVue.updateNode(type, newNode);
                }
            },
            /**
             * 更新拓扑图中的链路数据和DOM
             * @param type 操作类型，ADD/UPDATE/DELETE
             * @param newLink 待更新的链路数据
             */
            updateLink(type, newLink) {
                // 更新视图数据
                let links = this.links;
                switch (type) {
                    case 'ADD':
                        links.push(newLink);
                        break;
                    case 'UPDATE':
                        for (let i in links) {
                            let link = links[i];
                            if (link.uuid === newLink.uuid) {
                                this.$set(links, i, newLink);
                                break;
                            }
                        }
                        break;
                    case 'DELETE':
                        for (let i in links) {
                            let link = links[i];
                            if (link.uuid === newLink.uuid) {
                                links.splice(i, 1);
                                break;
                            }
                        }
                        break;
                    default:
                        console.log('Invalid operation!');
                        break;
                }
                // 更新视图DOM
                let topoVue = this.$refs.topo;
                if (topoVue) {
                    topoVue.updateLink(type, newLink);
                }
            }
        },
        watch: {
            topoData: {
                handler(now, old) {
                    if (now) {
                        now.nodes.forEach(d => {
                            d.href = '#NE'
                        });
                        if (old && ((old.nodes.length && old.nodes.length !== now.nodes.length) ||
                                (old.links.length && old.links.length !== now.links.length))) {
                            // 非初始绘制时，刷新拓扑
                            this.refreshTopo();
                        } else {
                            // 初始绘制拓扑
                            this.nodes = now.nodes;
                            this.links = now.links;
                            this.$nextTick(() => {
                                let topo = this.$refs.topo;
                                if (topo) {
                                    topo.initTopo();
                                }
                            });
                        }
                    }
                }
            }
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.onResize);
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
    .topology-draw
        position relative
        width 100%
        height 100%
        font-size 0
        overflow hidden
        p.noData
            position absolute
            top 50%
            left 50%
            font-size 16px
            transform translate(-50%, -50%)
</style>
