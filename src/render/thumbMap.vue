<template>
  <svg class="thumbMap" v-bind="thumbSize" />
</template>

<script>
import * as d3 from 'd3';

export default {
  props: {
      nodes: Array,
      links: Array,
      size: Object
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
    initThumbTopo() {
      let o = d3.select(this.$el);
      o.select('g.thumb-nodes').selectAll('g').remove();
      o.select('g.thumb-links').selectAll('g').remove();
      if (this.nodes && this.links) {
        this.addVNodes(this.nodes);
        this.addVLinks(this.links);
      }
    },
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
    addVNodes(data) {
      let f = d3.select('#thumb-nodes').selectAll('g.node').data(data);
      let p = f.enter().append('g').attr('class', 'node').attr('id', t => 'thumbNode' + t.id)
      .classed('downNode', function (t) {
        return t.status === 'down';
      });
      
      this.addNode(p);
    },
    addVNode(data) {
      let f = d3.select('#thumb-nodes');
      let p = f.append('g').attr('class', 'node').classed('downNode', data.status === 'down')
        .attr('id', 'thumbNode' + data.id).datum(data);
        
      this.addNode(p);
    },
    addNode(p) {
      let size = this.nodeSize
      // 设置图标
      p.append('circle').attr('r', size / 3).classed('nodeCircle', true);
      p.append('use').attr('width', size).attr('height', size)
        .attr('xlink:href', d => { return d.href }).attr('class', 'image');
    },
    addVLinks(data) {
      let f = d3.select('#thumb-links').selectAll('g.link').data(data);
      let p = f.enter().append('g').attr('class', 'link').attr('id', function (t) {
        return 'thumbLink' + t.id;
      }).classed('downLink', function (t) {
        return t.status === 'down';
      });
      p.append('path').classed('link', true);
    },
    addVLink(data) {
      let f = d3.select('#thumb-links');
      let p = f.append('g').attr('class', 'link').attr('id', 'link' + data.id)
        .classed('downLink', data.status === 'down').datum(data);
      p.append('path').classed('link', true);
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