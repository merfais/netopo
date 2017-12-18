<template>
<div style='background:#fff;'>
  <svg id='ss'
    :width="width"
    :height="height"
    ref="svg2"
    class='bor'
    >
  </svg>
  <div
    :style='{height: "500px", width: "1100px", }'
    ref="svg3"
    class='bor'
    >
  </div>
</div>
</template>

<script>
  const d3 = require('d3')
  import Network from 'src/index.js'

  export default {
    components: {
    },
    props: {
      width: {
        default: '100%'
      },
      height: {
        default: '500'
      },
    },
    data() {
      return {
        nodes: [],
        links: [],
        $svg: null,
        starts: [],
        startsLength: 10,
        queue: {
          pre: null,
          next: null,
          fn: null,
          type: 's',
        },
        task: null,
      }
    },
    computed: {
    },
    methods: {
      genNodes(n = 10) {
        const nodes = []
        while(n--) {
          const isRect = _.random(1)
          const shape = {
            width: '20px',
            height: '20px',
            r: '20',
            type: isRect ? 'rect' : 'circle',
          }
          const x = _.random(1000)
          const y = _.random(500)
          const position = `translate(${x}, ${y})`
          const center = {
            x: x + parseInt(shape.width) / (isRect ? 2 : 1),
            y: y + parseInt(shape.height) / (isRect ? 2 : 1),
          }
          const label = {
            x: _.random(10),
            y: _.random(10),
            text: 'node_' + n,
          }
          nodes.push({
            shape,
            label,
            center,
            id: n,
            x,
            y,
            position,
          })
        }
        const x = 0
        const y = 0
        nodes[0] = {
          shape: {
            width: '100px',
            height: '100px',
            type: 'rect'
          },
          label: {
            x: 0,
            y: 100,
            // anchor: 'start',
            // position: 'translate(50, 100)',
            text: '中文中文',
          },
          center: {
            x: 50,
            y: 50,
          },
          position: `translate(${x}, ${y})`
        }
        nodes[1] = {
          shape: {
            width: '100px',
            height: '100px',
            type: 'image',
            src: require('../src/assets/images/erro-404.png'),
          },
          label: {
            x: 0,
            y: 100,
            // anchor: 'start',
            // position: 'translate(50, 100)',
            text: '中文中文',
          },
          center: {
            x: 50,
            y: 50,
          },
          position: `translate(400, 400)`
        }
        nodes[2] = {
          shape: {
            r: '50px',
            cx: '50px',
            cy: '50px',
            width: '100px',
            height: '100px',
            type: 'circle',
          },
          label: {
            x: '50px',
            y: '100px',
            text: '中文中文',
          },
          center: {
            x: 50,
            y: 50,
          },
          position: `translate(100, 100)`
        }
        return Object.freeze(nodes)
      },
      genLinks(nodes, n = 9) {
        const links = []
        const s = nodes[n].center
        while(n--) {
          links.push({
            x1: s.x,
            y1: s.y,
            x2: nodes[n].center.x,
            y2: nodes[n].center.y,
          })
        }
        return Object.freeze(links)
      },
      initCi() {
        const $root = d3.select('#ss')
        $root.selectAll('g').remove()
        const $nodes = $root.append('g').attr('class', 'nodes')
          .selectAll('g').data(this.starts).enter().append('g')
          .attr('class', 'node')
          .attr('transform', d => d.position)
        $nodes.append(d => {
          return document.createElementNS(d3.namespaces.svg, 'circle')
        })
          .attr('class', 'rect')
          .attr('cx', d => d.rr)
          .attr('cy', d => d.rr)
          .attr('r', d => d.rr)
      },
      calcPosition() {
        if (!this.lastTime) {
          this.lastTime = (new Date()).getTime()
          let n = this.startsLength
          while(n--) {
            const r = _.random(50, 200)
            const angle = _.random(360)
            const x = 220 + r * Math.cos(angle * Math.PI / 180)
            const y = 220 + r * Math.sin(angle * Math.PI / 180)
            const position = `translate(${x}, ${y})`
            const rr = _.random(5, 20)
            this.starts.push({
              position,
              r,
              angle,
              p: 20 * 1000,
              rr,
            })
          }
          this.initCi()
        } else {
          const now = (new Date()).getTime()
          const step = now - this.lastTime
          this.lastTime = now
          let n = -1
          while(++n < this.startsLength) {
            let {r, angle , p} = this.starts[n]
            angle += step * 360 / p
            const x = 220 + r * Math.cos(angle * Math.PI / 180)
            const y = 220 + r * Math.sin(angle * Math.PI / 180)
            const position = `translate(${x}, ${y})`
            this.starts[n].position = position
            this.starts[n].angle = angle
          }
        }
      },
      refresh() {
        this.calcPosition()
        const $root = d3.select('#ss')
        $root.selectAll('.nodes')
          .selectAll('g').data(this.starts)
          .attr('transform', d => d.position).transition()
      },
      an() {
        const fps = _.round(1000 / 18, 5)
        setInterval(() => {
          const job = {
            pre: this.task.pre,
            next: this.task,
            fn: this.refresh,
            type: 's'
          }
          this.task.pre.next = job
          this.task.pre = job
        }, fps)

        const heavy = (s) => {
          return () => {
            let nn = 600
            for(let i= 0; i < nn; i++) {
              for(let j = 0; j < nn; j++) {
              }
            }
          }
        }
        let ii = 10
        while(ii--) {
          setInterval(() => {
            if (this.task.pre.type === 'h') {
              const job = {
                pre: this.task.pre,
                next: this.task,
                fn: this.refresh,
                type: 's'
              }
              this.task.pre.next = job
              this.task.pre = job
            }
            const hJob = {
              type: 'h',
                pre: this.task.pre,
                next: this.task,
                fn: heavy(_.random(1000)),
            }
            this.task.pre.next = hJob
            this.task.pre = hJob
          }, _.random(500, 2000))
        }
      },
      initQueue() {
        this.queue.pre = this.queue
        this.queue.next = this.queue
        this.task = this.queue
        this.working()
      },
      working() {
        const fps = _.round(1000 / 30, 5)
        setInterval(() => {
          const job = this.task.next
          if (job.next !== job) {
            this.task.next = job.next
            job.next.pre = this.task
            job.fn()
          }
        }, fps)
      },
      renderD3(nodes, links) {
        const $root = d3.select('#ss')
        $root.selectAll('g').remove()
        const $nodes = $root.append('g').attr('class', 'nodes')
          .selectAll('g').data(nodes).enter().append('g')
          .attr('class', 'node')
          .attr('transform', d => d.position)
          .call(d3.drag()
            .on('start', this.dragStarte)
            .on('drag', e => {console.log(11111,e)})
            .on('end', this.dragEnded)
          )
        $nodes.append(d => {
          return document.createElementNS(d3.namespaces.svg, d.shape.type)
        })
          .attr('class', 'rect')
          .attr('width', d => d.shape.width)
          .attr('height', d => d.shape.height)
          .attr('cx', d => d.shape.cx || d.shape.width)
          .attr('cy', d => d.shape.cy || d.shape.height)
          .attr('r', d => d.shape.r)
          .attr('xlink:href', d => d.shape.src)

        $nodes.append(d => {
          d._a = '#' + d.id
          const $fo = d3.select(document.createElementNS(d3.namespaces.svg, 'foreignObject'))
          $fo.attr('width', d.shape.width)
             .attr('height', d.shape.height)
             .attr('transform', 'translate(0, 0)')
             // .attr('y', d.shape.height)
            // .attr('externalResourcesRequired', true)
            //.append('body')
            //.attr('xmlns', 'http://www.w3.org/1999/xhtml')
            .append('xhtml:div')
              .attr('class', 'text')
              .html(d.label.text)
              .style()
          return $fo.node()
        }).attr('data-none', (dd, q,w,e) => {
          return null
        })

          // .attr('x', d => d.label.x)
          // .attr('y', d => d.label.y)
          //.attr('transform', d => d.label.position)
          //.attr('text-anchor', d => d.label.anchor)
          //.text(d => d.label.text)
        const $links = $root.append('g').attr('class', 'links')
        $links.selectAll('line').data(links).enter().append('path')
          .attr('class', 'line')
          .attr('d', d => {
            const path = d3.path()
            path.moveTo(d.x1, d.y1)
            path.lineTo(d.x1, d.y1)
            return path
          }).transition().duration(1000)
          .attr('d', d=> {
            const path = d3.path()
            path.moveTo(d.x1, d.y1)
            path.lineTo(d.x2, d.y2)
            return path
          })

          // .attr('y1', d => d.y1)
          // .attr('x2', d => d.x2)
          // .attr('y2', d => d.y2)
        // this.an()
      },
      genNetworkNode(n = 10) {
        const data = []
        const shape = ['rect', 'circle', 'images']
        while(n--) {
          data.push({
            id: 'node' + n,
            position: { // 映射transform
              x: n === 8 ? 0 : _.random(1000),
              y: n === 8 ? 0 : _.random(400),
            },
            shape: {
              type: _.random(1) ? 'circle' : 'circle',
              // x: 0,
              // y: 0,
              // rx: 5,
              // ry: 5,
              // width: 100,
              // height: 30,
              // style: {},
              // class: 'rect',
            },
            label: {
              text: '测试测试测试' + n,
              // x: 0,
              // y: 0,
              // width: 100,
              // height: 30,
              // style: {}
            },
            value: n
          })
        }
        return data
      },
      genNetworkEdge(e = 20, n = 10) {
        const map = new Map()
        let m = n
        while(m--) {
          map.set(m, m)
        }
        const data = []
        let count =_.round(_.random(n / 40,  n / 20))
        while (count--) {
          const source = _.random(n - 1)
          map.delete(source)
          let rc = _.random(n / 20, n / 10)
          while(--rc > 0) {
            const target = _.random(n - 1)
            map.delete(target)
            data.push({
              id: 'edge' + source + '_' + target,
              source:'node' + source,
              target:'node' + target,
              value: e,
            })
          }
        }
        /*
        */
        const rs = [...map.values()]
        let l = rs.length - 1
        while(l > 0) {
          const source = rs[l]
          let target = rs[l - 1] ? rs[l - 1] : 1
          data.push({
            id: 'edge' + source + '_' + target,
            source: 'node' + source,
            target: 'node' + target,
            value: e,
          })
          l -= 2
        }
        return data
      },
      renderNet() {
        const network = new Network(this.$refs.svg3, {
          simulation: {
            enable: true,
          }
        })
        network.render({
          nodes: this.genNetworkNode(100),
          edges: this.genNetworkEdge(100, 100),
        })
      },
      render() {
        // console.log(select(this.$refs.svg))
        const tmpN = this.genNodes(100)
        const tmpL = this.genLinks(tmpN, 10 - 1)
        // this.nodes = tmpN
        // this.links = tmpL
        this.$nextTick(() => {
          // this.bindEvents()
        })
        this.renderD3(tmpN, tmpL)
        this.renderNet()
        // this.initQueue()
        // this.an()
      },
      test() {
        this.render()
      },
      bindEvents() {
        const t = this.$svg.select('.nodes').selectAll('g')
        t.call(d3.drag()
          .on('start', this.dragStarte)
          .on('drag', e => {console.log(11111,e)})
          .on('end', this.dragEnded)
        )
      },
      dragStarted(e) {
        console.log('dragStarted', e)
      },
      dragged(e) {
        console.log('dragged', e)
      },
      dragEnded(e) {
        console.log('dragEnded', e)
      },
      zoomed(e) {
        console.log('zoom', e)
      }
    },
    mounted() {
      this.$svg = d3.select(this.$refs.svg)
      this.render()
    },
  }
</script>

<style>
  @import '../src/assets/css/global-variable.css';

  .bor {
    // background: var(--g-light-bgcolor)
    border: 1px solid #333;
  }

  .nodes {

    rect {
      fill: green;
    }

    circle {
      fill: green;
    }

    text {
      fill: #fff;
    }
  }

  .links {

    .line {
      stroke: red;
    }
  }

  .rect {
    fill: green;
  }

  .text {
    display: flex;
    height: 100%;
    justify-content: center;
    align-items: center;
    word-break: break-all;
    line-height: 1.2em;
    padding: 10px;
  }


</style>
