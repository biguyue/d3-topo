/**
* 工具栏快捷键
* Created by mhcai on 2019/4/4 11:24.
*/
import * as d3 from 'd3'

export default {
    data() {
        return {
            actionMap: {
                S: this.switchNodeLable, // 切换节点标签
                D: this.deleteNodeCoordinates
            }, // 快捷键与事件集合
            KEYS: [], // 快捷键
            KEYDOWN: [] // 存放正按下的键
        }
    },
    created() {
        this.initActionMap();
        this.shortCutKeyInstall();
    },
    methods: {
        /**
         * 初始化快捷键集合
         */
        initActionMap() {
            if (Array.isArray(this.toolbarRender)) {
                this.toolbarRender.forEach(d => {
                    if (d.key && typeof d.fn === 'function') {
                        this.actionMap[d.key] = d.fn;
                    }
                })
                for (let key in this.actionMap) {
                    this.KEYS.push(key)
                }
            }
        },
        /**
         * 安装快捷键监听
         */
        shortCutKeyInstall() {
            window.addEventListener('keydown', this.shortCutKeyIn);

            window.addEventListener('keyup', this.removeKey);
        },
        /**
         * 返回当前的按键
         */
        whatKey(code) {
            switch (code) {
                case 8: return 'delete';
                case 9: return 'tab';
                case 13: return 'enter';
                case 16: return 'shift';
                case 17: return 'ctrl';
                case 18: return 'alt';
                case 27: return 'esc';
                case 32: return 'space';
                default:
                    if ((code >= 48 && code <= 57) || (code >= 65 && code <= 90)) {
                        return String.fromCharCode(code);
                    } else if (code >= 112 && code <= 123) {
                        return 'F' + (code - 111);
                    }
                    return '.';
            }
        },
        /**
         * 触发事件，并存储按键信息
         * @param event
         */
        shortCutKeyIn(event) {
            event = event || d3.event;
            // 捕获按键
            let keyCode = event.keyCode;

            // 如果是否个键长按 则不持续触发事件
            if (event.repeat) {
                return;
            }

            // 如果有多个按键同时按下不触发事件
            this.KEYDOWN.push(this.whatKey(keyCode));
            if (this.KEYDOWN.length !== 2) {
                return;
            }

            if (event.altKey && keyCode !== 17) {
                let key = this.whatKey(keyCode);
                this.dealKey(this.KEYS.indexOf(key), key);
            }
        },
        /**
         * 清除按键信息
         * @param e
         */
        removeKey(e) {
            e = e || d3.event;
            let keyCode = e.keyCode;
            let key = this.whatKey(keyCode);
            let index = this.KEYDOWN.indexOf(key);
            this.KEYDOWN.splice(index, 1);
        },
        /**
         * 判断该场景是否包含该快捷键
         * @param keyIndex
         * @param key
         */
        dealKey(keyIndex, key) {
            if (keyIndex > -1) {
                this.keyIn(key);
            }
        },
        /**
         * 执行快捷键功能
         * @param key
         */
        keyIn(key) {
            let data = this.getActionEntry(key);
            console.log(data)
            if (data !== null) {
                data();
            }
        },
        /**
         * 找到菜单中的方法
         * @param key
         * @returns {*}
         */
        getActionEntry(key) {
            let entry = this.actionMap[key];

            if (!entry) {
                console.log(entry + ' key action is not valid');
                return null;
            }
            return entry;
        },
        /**
         * 切换节点标签内容
         */
        switchNodeLable() {
            let type = 'name';
            if (this.nodeLabel === 'name') {
                type = 'ip'
            }
            // this.$store.commit('topo/SET_NE_LABEL', type);
        },
        /**
         * 批量保存节点坐标
         */
        saveAllNodeCoordinates() {
            // let nodes = d3.selectAll('g.node').data();
            // 按接口入参模型定义对象
        },
        /**
         * 单点保存节点坐标
         * @param param
         */
        saveNodeCoordinate(param) {
            // 调用接口存储网元坐标
            console.log(param)
        },
        /**
         * 清除所有节点的坐标
         */
        deleteNodeCoordinates() {
            let nodes = d3.selectAll('g.node').data();
            if (Array.isArray(nodes)) {
                let ids = [];
                nodes.forEach(d => {
                    d.isfixed = false;
                    d.fx = d.fy = null;
                    ids.push(d.uuid);
                });
                let topoVue = this.$refs.topo;
                if (topoVue) {
                    topoVue.simulation.alpha(0.1).alphaTarget(0.02).restart();
                }
                // 调用清除坐标的接口
            }
        }
    }
}
