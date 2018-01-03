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

function createSvgWrapper(dom) {
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
  const grid = merge({
    width: dom.clientWidth + 'px',
    height: dom.clientHeight + 'px',
  }, options.grid)
  const $svgWrapper = $container.append('div').call(bindStyle({
    width: grid.width,
    height: grid.height || '500px',
    margin: `${grid.top} ${grid.right} ${grid.bottom} ${grid.left}`,
    position: 'relative',
    overflow: 'hidden',
  }))
  return $svgWrapper
}

export default class Network {

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
    const $svgWrapper = createSvgWrapper(dom)
    this._createSvg($svgWrapper)
    this._onResize = this._resizeHandler()
    onRezie(this._onResize)
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
    renderNodes(this._$nodeContainer, this._$nodeContainer2)
    renderEdges(this._$edgeContainer, this._$edgeContainer2)
    renderDefs(this._$defs)
    simulation.update(ds.nodes, ds.links)
  }

  setOptions(opts) {
    merge(options, opts)
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
    offResize(this._onResize)
    ds.clear()
    eventer.emit('destroy')
    eventer.destroy()
  }

  _createSvg($svgWrapper) {
    this._$graph = $svgWrapper.append('svg').call(bindStyle({
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
    zoom.create($svgWrapper, this._$graph, $zoomWrapper)
  }

  _resizeHandler() {
    return () => {
      console.log('resize')
    }
  }
}
