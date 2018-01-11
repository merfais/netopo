import {
  select
} from 'd3-selection'
import {
  bindStyle,
  bindAttr,
  merge,
  onRezie,
  offResize,
} from './util'
import ds from './dataSet'
import options from './options'
import eventer from './event'
import {
  renderNodes,
  updateNodesPosition,
  appendHiddenDiv,
  destroyNodes,
} from './node/index'
import {
  renderEdges,
  updateEdgesPosition,
  destroyEdges
} from './edge/index'
import {
  renderDefs,
  destroyDefs,
} from './defs'
import tooltip from './tooltip'
import simulation from './simulation'
import zoom from './zoom'
import drag from './drag'

function createGraphWrapper(dom) {
  if (typeof dom === 'string') {
    dom = document.getElementById(dom)
  }
  if (!dom.getBoundingClientRect) {
    throw new Error('real DOM instance or an exist DOM id is required')
  }
  const $container = select(dom).append('div').call(bindStyle({
    position: 'relative',
    width: '100%',
    height: '100%',
  }))
  tooltip.create($container)
  appendHiddenDiv($container)
  const grid = options.grid
  const $wrapper = $container.append('div').call(bindStyle({
    width: grid.width,
    height: grid.height,
    margin: `${grid.top} ${grid.right} ${grid.bottom} ${grid.left}`,
    position: 'relative',
    overflow: 'hidden',
  }))
  return $wrapper
}

function getRect(dom) {
  if (dom) {
    return {
      width: dom.clientWidth,
      height: dom.clientHeight,
    }
  }
  return { width: 0, height: 0 }
}

export default class Network {

  _$graphWrapper = null
  _$graph = null
  _$defs = null
  _$edgeContainer = null
  _$edgeContainer2 = null
  _$nodeContainer = null
  _$nodeContainer2 = null

  constructor(dom, opts) {
    if (!dom) {
      throw new Error('dom paramter is required')
    }
    merge(options, opts)
    this._createGraph(dom)
    this._onResize = this._createResizeHandler()
    if (this._onResize) {
      onRezie(this._onResize)
    }
    const updateNodes = updateNodesPosition(this._$nodeContainer, this._$nodeContainer2)
    const updateEdges = updateEdgesPosition(this._$edgeContainer, this._$edgeContainer2)
    simulation.create(updateNodes, updateEdges, this._$graph)
    drag.create(updateNodes, updateEdges, this._$zoomWrapper)
  }

  render({ nodes = [], edges = [] }) {
    if (!Array.isArray(nodes)) {
      throw new Error('type error: nodes must be Array')
    }
    if (!Array.isArray(edges)) {
      throw new Error('type error: edges must be Array')
    }
    ds.nodes = nodes
    ds.edges = edges
    this._update()
  }

  setOptions(opts) {
    merge(options, opts)
    this._update()
  }

  destroy() {
    tooltip.destroy()
    zoom.destroy()
    simulation.destroy()
    drag.destroy()
    destroyNodes(this._$nodeContainer, this._$nodeContainer2)
    destroyEdges(this._$edgeContainer, this._$edgeContainer2)
    destroyDefs(this._$defs)
    this._$graph = null
    this._$defs = null
    this._$edgeContainer = null
    this._$edgeContainer2 = null
    this._$nodeContainer = null
    this._$nodeContainer2 = null
    this._$zoomWrapper = null
    this._opts = null
    this._onResize = null
    offResize(this._onResize)
    ds.clear()
    eventer.emit('destroy')
    eventer.destroy()
  }

  _createGraph(dom) {
    this._$graphWrapper = createGraphWrapper(dom)
    this._$graph = this._$graphWrapper.append('svg').call(bindStyle({
      width: '100%',
      height: '100%',
      'user-select': 'none',
    })).call(bindAttr({
      class: 'network-topo',
    }))
    this._$defs = this._$graph.append('defs')
    const $zoomWrapper = this._$graph.append('g').attr('class', 'zoom-wrapper')
    this._$edgeContainer = $zoomWrapper.append('g').attr('class', 'nt-edges')
    this._$nodeContainer = $zoomWrapper.append('g').attr('class', 'nt-nodes')
    this._$edgeContainer2 = $zoomWrapper.append('g').attr('class', 'nt-edges-cover')
    this._$nodeContainer2 = $zoomWrapper.append('g').attr('class', 'nt-nodes-cover')
    this._$zoomWrapper = $zoomWrapper
    zoom.create(this._$graphWrapper, this._$graph, $zoomWrapper)
  }

  _update() {
    renderNodes(this._$nodeContainer, this._$nodeContainer2)
    renderEdges(this._$edgeContainer, this._$edgeContainer2)
    renderDefs(this._$defs)
    simulation.update(ds.nodes, ds.links)
    zoom.update()
  }

  _createResizeHandler() {
    const resize = options.resize || {}
    let wrapperRect = getRect(this._$graphWrapper.node())
    if (resize.enable) {
      return () => {
        // 默认使用zoom，只有当需要重新计算位置时再用redraw
        if (resize.action.redraw) {
          this._update()
        } else {
          const rect = getRect(this._$graphWrapper.node())
          const scale = resize.action.zoomBase === 'width' ?
            rect.width / wrapperRect.width :
            rect.height / wrapperRect.height
          wrapperRect = rect
          if (scale !== 1) {
            zoom.resizeZoom(rect, scale)
          }
        }
      }
    } else {
      return null
    }
  }
}
