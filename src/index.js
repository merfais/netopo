import _ from 'lodash'
import {
  select,
} from 'd3-selection'
import {
  bindStyle,
  merge,
  onRezie,
  offResize,
  DataSet,
  Eventer,
  Tooltip,
  Simulation,
  Zoom,
  Drag,
  Filter,
} from './helper'
import {
  renderNodes,
  updateNodes,
  destroyNodes,
} from './node'
import {
  renderEdges,
  updateEdges,
  destroyEdges,
} from './edge'
import {
  renderFilters
} from './defs'

function getRect(dom) {
  if (dom) {
    return {
      width: dom.clientWidth,
      height: dom.clientHeight,
    }
  }
  return { width: 0, height: 0 }
}

function genCalcLabelHeigth($parent) {
  if ($parent) {
    let $labelDiv = null
    let $labelDivWrapper = null
    let labelDivStyle = {}
    let labelWidth = null
    let height = 0
    $labelDivWrapper = $parent.append('div').call(bindStyle({
      visibility: 'hidden',
      position: 'absolute',
    }))
    $labelDiv = $labelDivWrapper.append('div')
    return label => {
      if (label.width !== null && label.width !== labelWidth) {
        labelWidth = label.width
        $labelDivWrapper.style('width', parseFloat(label.width) + 'px')
      }
      $labelDiv.html(label.text)
      if (!_.isEqual(labelDivStyle, label.style)) {
        labelDivStyle = label.style
        $labelDiv.call(bindStyle(label.style))
        height = $labelDivWrapper.node().clientHeight
      }
      return height
    }
  }
  return () => {}
}

function dftOptions() {
  return {
    grid: {
      top: '0px',       // margin.top
      right: '0px',     // margin.right
      left: '0px',      // margin.left
      bottom: '0px',    // margin.bottom
      width: '100%',
      height: '100%',
    },
    node: {
      shape: {
        type: 'circle'
      },
      label: {},
      shadow: {
        enable: false,
        normal: {},
        hover: {},
      },
      tooltip: {
        enable: true,
        formatter: d => `${d.label.text || d.id}: ${d.value}`,
      },
      drag: {
        enable: true,
      },
    },
    edge: {
      shape: {
        type: 'line',
      },
      path: [],
      hoverBoundarySpan: 10,
      shadow: {
        enable: false,  // edge shadow有非常大的性能问题，慎用
        normal: {},
        hover: {},
      },
      tooltip: {
        enable: true,
        formatter: d => `${d.source} -> ${d.target}: ${d.value}`
      },
    },
    tooltip: {
      // style
    },
    zoom: {
      thumbnails: {
        // style
      },
    },
    resize: {
      enable: true,
      action: {
        redraw: false,      // false =》zoom
        zoomBase: 'width',  // 当zoom以width还是以height为缩放基准
      },
    },
    filter: {
      brighter: {
        value: 1,
      },
      darker: {
        value: 1
      },
      custom: {}
    },
    simulation: {
      enable: true,
    },
  }
}

export default class TopoGraph {

  options = {}
  $root = null
  $graphWrapper = null
  $graph = null
  $defs = null
  $zoomWrapper = null
  $edgeContainer = null
  $edgeContainer2 = null
  $nodeContainer = null
  $nodeContainer2 = null
  tooltip = null
  zoom = null
  drag = null
  simulation = null
  ds = null
  eventer = null
  filter = null

  constructor(dom, opts) {
    if (!dom) {
      throw new Error('dom paramter is required')
    }
    if (typeof dom === 'string') {
      dom = document.getElementById(dom)
    }
    if (!(dom instanceof HTMLElement)) {
      throw new Error('an exist DOM instance or a DOM id is required')
    }
    this.options = merge(dftOptions(), opts)
    this.ds = new DataSet()
    this.eventer = new Eventer()
    this.filter = new Filter()
    this._createGraph(dom)
    this._onResize = this._createResizeHandler()
    if (this._onResize) {
      onRezie(this._onResize)
    }
    const update = {
      nodes: updateNodes(this),
      edges: updateEdges(this)
    }
    this.simulation = new Simulation(this.options)
      .create(this.$graph, this.eventer, update)
    this.drag = new Drag(this.options)
      .create(this.$zoomWrapper, this.eventer, update)
  }

  render({ nodes = [], edges = [] }) {
    if (!Array.isArray(nodes)) {
      throw new Error('type error: nodes must be Array')
    }
    if (!Array.isArray(edges)) {
      throw new Error('type error: edges must be Array')
    }
    this.ds.nodes = nodes
    this.ds.edges = edges
    this._update()
    return this
  }

  setOptions(opts) {
    this.options = merge(this.options, opts)
    return this
  }

  getOptionsRef() {
    return this.options
  }

  resize() {
    this._onResize()
    return this
  }

  on(names, handler) {
    if (typeof names === 'string') {
      names = [names]
    } else if (!_.isArray(names)) {
      throw new Error('event name type should be string or Array[string]')
    }
    _.forEach(names, name => {
      this.eventer.on(name, handler)
    })
    return this
  }

  off(names, handler) {
    if (typeof names === 'string') {
      names = [names]
    } else if (!_.isArray(names)) {
      throw new Error('event name type should be string or Array[string]')
    }
    _.forEach(names, name => {
      this.eventer.off(name, handler)
    })
    return this
  }

  destroy() {
    this.tooltip.destroy()
    this.zoom.destroy()
    this.simulation.destroy()
    this.drag.destroy()
    destroyNodes(this)
    destroyEdges(this)
    this.$root.remove()
    this.$root = null
    this.$graph = null
    this.$defs = null
    this.$edgeContainer = null
    this.$edgeContainer2 = null
    this.$nodeContainer = null
    this.$nodeContainer2 = null
    this.$zoomWrapper = null
    this.options = null
    this._onResize = null
    offResize(this._onResize)
    this.ds.clear()
    this.filter.clear()
    this.eventer.emit('destroy')
    this.eventer.destroy()
  }

  _createGraph(dom) {
    const grid = this.options.grid
    this.$root = select(dom).append('div').call(bindStyle({
      position: 'relative',
      width: grid.width,
      height: grid.height,
      padding: `${grid.top} ${grid.right} ${grid.bottom} ${grid.left}`,
    }))
    // 添加一个隐藏DIV用于生成节点时计算文字高度
    this.calcLabelHeight = genCalcLabelHeigth(this.$root)
    this.tooltip = new Tooltip(this.options)
      .create(this.$root, this.eventer, this.ds)
    this.$graphWrapper = this.$root.append('div').call(bindStyle({
      position: 'relative',
      overflow: 'hidden',
      width: '100%',
      height: '100%',
    })).attr('class', 'graph-wrapper')
    this.$graph = this.$graphWrapper.append('svg').call(bindStyle({
      width: '100%',
      height: '100%',
      'user-select': 'none',
    })).attr('class', 'topo-graph')
    this.$defs = this.$graph.append('defs')
    const $zoomWrapper = this.$graph.append('g').attr('class', 'zoom-wrapper')
    this.$edgeContainer = $zoomWrapper.append('g').attr('class', 'tg-edges')
    this.$nodeContainer = $zoomWrapper.append('g').attr('class', 'tg-nodes')
    this.$edgeContainer2 = $zoomWrapper.append('g').attr('class', 'tg-edges-cover')
    this.$nodeContainer2 = $zoomWrapper.append('g').attr('class', 'tg-nodes-cover')
    this.$zoomWrapper = $zoomWrapper
    this.zoom = new Zoom(this.options)
      .create(this.$root, this.$graph, $zoomWrapper, this.eventer)
  }

  _update() {
    renderNodes(this)
    renderEdges(this)
    renderFilters(this.$defs, this.filter, this.options.filter)
    this.zoom.update()
    this.simulation.update(this.ds.nodes, this.ds.links)
  }

  _createResizeHandler() {
    const resize = this.options.resize || {}
    let wrapperRect = getRect(this.$graphWrapper.node())
    if (resize.enable) {
      return () => {
        // 默认使用zoom，只有当需要重新计算位置时再用redraw
        if (resize.action.redraw) {
          this._update()
        } else {
          const rect = getRect(this.$graphWrapper.node())
          let scale = 1
          if (resize.action.zoomBase === 'width' && rect.width) {
            scale = rect.width / wrapperRect.width
            wrapperRect = rect
          } else if (rect.height) {
            scale = rect.height / wrapperRect.height
            wrapperRect = rect
          }
          if (scale !== 1) {
            this.zoom.resizeZoom(scale, rect)
          }
        }
      }
    } else {
      return null
    }
  }
}
