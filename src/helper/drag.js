import _ from 'lodash'
import {
  event,
  select,
} from 'd3-selection'
import {
  drag
} from 'd3-drag'
import {
  bind,
  merge,
} from './util'

const theme = {
  cursor: 'move',
  opacity: 0.5,
  stroke: '#aaa',
  fill: '#ccc',
  'stroke-dasharray': 2,
  'stroke-width': 1,
  filter: null,
}

const dftOptions = {
  enable: true,
  mode: 'virtualNode',  // 默认使用虚拟节点模式，此参数暂未使用
  virtualNode: {
    style: theme,
  },
}

function createVirtualNode(d, node, virtualNodeStyle) {
  let style = virtualNodeStyle
  if (d.drag && d.drag.virtualNode && d.drag.virtualNode.style) {
    style = merge({}, virtualNodeStyle, d.drag.virtualNode.style)
  }
  const attr = {
    id: 'dragger',
    transform: `translate(${d.position.x}, ${d.position.y})`,
  }
  node = node.cloneNode(false)
  const $node = select(node).call(bind({ attr, style }))
  return $node.node()
}

function moveVirtualNode(d, $dragger) {
  d.position.x += event.dx
  d.position.y += event.dy
  d.linkPoint.x += event.dx
  d.linkPoint.y += event.dy
  const translate = `translate(${d.position.x}, ${d.position.y})`
  $dragger.setAttribute('transform', translate)
}

export default class Drag {

  _opts = null
  _eventer = null
  _updateView = null
  _$zoomWrapper = null
  _dragger = null

  constructor(options) {
    if (_.has(options, 'drag')) {
      this._opts = merge({}, dftOptions, options.drag)
      options.drag = this._opts
    } else {
      this._opts = merge({}, dftOptions, options)
    }
  }

  create($zoomWrapper, eventer, update) {
    if (update && !_.isFunction(update.nodes)) {
      throw new Error('updateNodes must be function')
    }
    if (update && !_.isFunction(update.edges)) {
      throw new Error('updateEdges must be function')
    }
    this._eventer = eventer
    this._updateView = d => {
      update.nodes('drag', d)
      update.edges('drag', d)
    }
    this._$zoomWrapper = $zoomWrapper
    this._dragger = this._initDrag()
    this._eventer.emit('drag.create')
    return this
  }

  bind(opts) {
    return $selector => {
      if (opts && opts.enable === true) {
        $selector.call(this._dragger)
      }
    }
  }

  destroy() {
    this._dragger.on('start', null).on('drag', null).on('end', null)
    this._dragger = null
    this._opts = null
    this._$zoomWrapper = null
    this._eventer.emit('drag.destroy')
    this._eventer = null
  }

  _initDrag() {
    const virtualNodeStyle = this._opts.virtualNode.style
    const eventer = this._eventer
    const wrapper = this._$zoomWrapper.node()
    let draggerNode
    let dragOffset
    return drag().on('start', d => {
      dragOffset = 0
      draggerNode = null
      if (d.drag.enable) {
        eventer.emit('drag.start', event, d)
      }
    }).on('drag', function(d) {
      if (d.drag.enable) {
        dragOffset += event.dx ** 2 + event.dy ** 2
        if (draggerNode) {
          moveVirtualNode(d, draggerNode)
          eventer.emit('drag.dragging', event, d)
        } else if (dragOffset > 10) {
          draggerNode = createVirtualNode(d, this, virtualNodeStyle)
          wrapper.appendChild(draggerNode)
        }
      }
    }).on('end', d => {
      dragOffset = 0
      if (d.drag.enable) {
        if (draggerNode) {
          wrapper.removeChild(draggerNode)
          draggerNode = null
          d.position.x += event.dx
          d.position.y += event.dy
          d.linkPoint.x += event.dx
          d.linkPoint.y += event.dy
          this._updateView(d)
        }
        eventer.emit('drag.end', event, d)
      }
    })
  }
}
