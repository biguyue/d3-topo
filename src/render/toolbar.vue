<!--
 * 功能说明：拓扑工具栏
 * ==============配置说明==============
 * toolbarRender: 按钮数据对象的数组。结构如下：
 * [
 *    {
 *       id: String  // 按钮ID
 *       icon: String  // 按钮的图标className
 *       text: String  // 按钮名称
 *       key: String  // 快捷键，单个字母
 *       disabled: Boolean  // 按钮禁用
 *       fn: Function(e: event事件)  // 按钮点击事件
 *    }
 * ]
-->
<template>
    <div class="topo-toolbar">
        <!-- 工具栏按钮组 -->
        <div class="toolbar-groups">
            <!-- 依据toolbars渲染出对应按钮 -->
            <!-- 前3项按钮 -->
            <CButton class="toolbar-button" v-for="tool in toolbars1" :key="tool.id"
                     :icon="tool.icon" @click="tool.fn" :title="tool.tip">
                {{tool.text}}
            </CButton>
            <!-- 更多按钮 -->
            <div class="more-tools" v-if="moreButtonFlag">
                <el-popover placement="bottom" trigger="click" v-model="visible">
                    <div>
                        <ul>
                            <li v-for="tool in toolbars2" :key="tool.id" @click="visible=false">
                                <CButton class="toolbar-button list-button" @click="tool.fn"
                                         :icon="tool.icon" :title="tool.tip">
                                    {{tool.text}}
                                </CButton>
                            </li>
                        </ul>
                    </div>
                    <CButton slot="reference" class="toolbar-button more-button"
                        :icon="'icon-more'"></CButton>
                </el-popover>
            </div>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
    export default {
        props: {
            toolbarRender: {
                type: Array,
                default: () => {
                    return [];
                }
            }
        },
        data () {
            return {
                moreButtonFlag: false, //是否显示moreButton
                visible: false, //moreButton中的弹框是否显示
                toolbars: [],
                toolbars1: [], //工具栏中前3个子项
                toolbars2: [] //工具栏中除前3个子项外，所有的子项
            }
        },
        watch: {
            toolbarRender: {
                handler (now) {
                    this.initToolbar();
                },
                deep: true,
                immediate: true
            }
        },
        methods: {
            /**
            * 对工具栏数据进行预处理
            */
            initToolbar () {
                let list = this.GLOBAL.$_.cloneDeep(this.toolbarRender);
                list.forEach(d => {
                    d.id = 'toolbar-' + d.id;
                    // title提示信息
                    d.tip = d.key ? ('快捷键：Alt+' + d.key) : ''
                });
                this.toolbars = list;
                //当工具栏中的子项>3时，只显示前3个子项，后续子项在...中显示
                if (this.toolbars.length > 3) {
                    this.moreButtonFlag = true
                    //toolbars1存放前3项
                    this.toolbars1 = this.toolbars.slice(0, 3)
                    //toolbars2存放剩余子项
                    this.toolbars2 = this.toolbars.slice(3)
                } else {
                    this.moreButtonFlag = false
                    this.toolbars1 = this.toolbars
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
    @import '../style/varibles.styl';
    @import '../style/mixins.styl';

    .topo-toolbar
        position absolute
        top 0.3rem
        right 0
        text-align right
        .toolbar-groups
            margin-right 0.45rem
            flexLayout(row-reverse)
            .toolbar-button
                min-width 0.8rem
                height 0.28rem
                line-height calc(0.28rem - 2px)
                color #BBBBBB
                background $background
                border 1px solid #BBBBBB
                &:hover
                    color $background
                    background $mbotton_bg_color
                    border 1px solid $mbotton_bg_color
                &:active
                    color $background
                    background $mbotton_active_bg_color
                    border 1px solid $mbotton_active_bg_color
                /deep/ .iconfont
                    font-size 0.16rem
                    margin-right 0.05rem
            .el-button + .el-button
                margin 0 0.13rem 0 0
            .more-tools
                position relative
                margin-right 0.13rem
                .more-button
                    width 0.33rem
                    min-width unset
                    padding 0
                    &:hover
                        color $background
                        background $mbotton_bg_color
                        border 1px solid $mbotton_bg_color
                    &:focus
                        color $background
                        background $mbotton_bg_color
                        border 1px solid $mbotton_bg_color
                    /deep/ .iconfont
                        margin 0
    .el-popover // 更多按钮列表
        .list-button
            height 0.29rem
            line-height 0.29rem
            min-width 0.8rem
            margin 0.02rem 0
            background $background
            border 1px solid $background
            color #808FAE
            &:hover
                color $background
                background $mbotton_bg_color
                border 1px solid $mbotton_bg_color
            &:active
                color $background
                background $mbotton_active_bg_color
                border 1px solid $mbotton_active_bg_color
            /deep/ .iconfont
                font-size 0.16rem
                margin-right 0.05rem
</style>
