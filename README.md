# d3-topo

基于D3-Force力导向图实现和封装的拓扑图绘制工具

## 安装
npm install d3-topo

在main.js按如下方式引入
```
import d3Topo from 'd3-topo';
Vue.use(d3Topo);
```

使用时，通过\<d3-topo>\</d3-topo>标签引入拓扑组件

## 功能
1. 展示节点之间的连线关系
2. 支持缩放、平移和双击重置功能
3. 提供节点、链路、空白处的点击事件，供父组件自定义交互效果
4. 支持扩展工具栏和小地图

## 使用说明
### Props
属性 | 说明 | 类型 | 默认值
---- | ---- | ---- | ----
topoData | 必填。拓扑图的数据对象，包含节点和链路。具体格式后续介绍 | Object | -
nodeLabel | 定义节点标签显示的内容。id/ip/name，三个配置中选一个，默认是节点名称 | String | name
loading | 加载中。若数据还在查询中，该值可设置为true | Boolean | false
toolbarRender | 插件中自带工具栏样式，若传入该配置，拓扑图右上角  将解析显示出一排工具按钮。具体格式后续介绍 | Array | -
thumb | 是否显示缩略小地图。默认不显示 | Boolean | false
thumbStyle | 支持修改小地图样式 | Object | -
allowRightClick | 是否支持右键点击事件。默认关闭右键事件，若想定义右键菜单，需开启此项 | Boolean | false

+ topoData：
{<br>
&emsp;nodes: [<br>
&emsp;&emsp;{<br>
&emsp;&emsp;&emsp;id: String <code>//节点标识，必配项</code><br>
&emsp;&emsp;&emsp;name: String <code>//节点名称</code><br>
&emsp;&emsp;&emsp;ip: String <code>//节点IP地址</code><br>
&emsp;&emsp;&emsp;status: String <code>//节点在线状态。up=在线，down=离线</code><br>
&emsp;&emsp;}<br>
&emsp;&emsp;……<br>
&emsp;],<br>
&emsp;links: [<br>
&emsp;&emsp;{<br>
&emsp;&emsp;&emsp;id: String <code>//链路标识，必配项</code><br>
&emsp;&emsp;&emsp;name: String <code>//链路名称</code><br>
&emsp;&emsp;&emsp;source: String/Number <code>//链路源节点id或索引值</code><br>
&emsp;&emsp;&emsp;target: String/Number <code>//链路宿节点id或索引值</code><br>
&emsp;&emsp;}<br>
&emsp;&emsp;……<br>
&emsp;]<br>
}<br>

> 链路的源宿节点通过source和target标识。d3-force内部会根据节点id或者是在节点数组中的索引找到该节点对象，然后把链路数据的source和target替换成对应的节点对象

> topoData数据变化后，拓扑会自动重绘刷新

+ toolbarRender：
[<br>
&emsp;{<br>
&emsp;&emsp;id: String <code>//按钮ID</code><br>
&emsp;&emsp;icon: String <code>//按钮图标的iconfont样式名</code><br>
&emsp;&emsp;text: String <code>//按钮名称</code><br>
&emsp;&emsp;key: String <code>//快捷键，单个字母</code><br>
&emsp;&emsp;disabled: Boolean <code>//按钮是否禁用，默认否</code><br>
&emsp;&emsp;fn: Function(e: event事件) <code>//按钮点击事件</code><br>
&emsp;}<br>
&emsp;……<br>
]<br>

### Events
事件名 | 说明 | 返回值
----- | ----- | -----
node-select | 节点选择事件。点中节点时触发该事件，可用于实现选中高亮、打开节点属性面板等效果 | (node, e)<br>node: 选中的节点数据对象<br>e: 鼠标事件对象
link-select | 链路选择事件。点中链路时触发该事件 | (link, e)<br>link: 选中的链路数据对象<br>e: 鼠标事件对象
click-blank | 空白点击事件。点中空白位置后触发该事件，可以在此时取消选中高亮或关闭面板等 | e: 鼠标事件对象
right-click | 鼠标右键事件。右键点击拓扑后触发该事件，可用于打开右键菜单栏 | 若右键节点、链路，返回值如下：<br>{<br>&emsp;type: 'node/link'<br>&emsp;data: 节点、链路数据对象<br>&emsp;event: 鼠标事件对象<br>}<br>若右键空白，返回值是null
drag-end | 节点拖拽结束后的事件 | 节点数据对象
draw-callback | 拓扑图的DOM树绘制完毕后的回调，此时已经可以对DOM执行一些操作 | -
tick-stop | d3-Force力导向图的力学抖动事件结束时的回调，此时节点坐标基本计算完毕不会再抖动 | -

#### 对外暴露的数据和函数
* nodes: Array <code>//拓扑图的节点数据</code>
* links：Array <code>//拓扑图的链路数据</code>
* updateNode: Function <code>//更新节点数据。入参如下：</code>
  * type: String <code>//更新类型ADD/UPDATE/DELETE</code>
  * nodes: Object <code>//要更新的节点数据</code>
* updateLink: Function <code>//更新链路数据。入参如下：</code>
  * type: String <code>//更新类型ADD/UPDATE/DELETE</code>
  * links: Object <code>//要更新的链路数据</code>
> 拓扑组件支持动态增删节点，或者是更新节点的ip、name、status属性（即更改标签或在线状态）。但仅提供了单个修改的方法
