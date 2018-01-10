import {
  event,
  select,
} from 'd3-selection'
import {
  drag
} from 'd3-drag'
import eventer from './event'
import {
  bind,
} from './util'

function createVirtualNode(d, node) {
  node = node.cloneNode(false)
  const $node = select(node).call(bind({
    attr: {
      id: 'dragger',
      transform: `translate(${d.position.x}, ${d.position.y})`,
    },
    style: {
      cursor: 'move',
      opacity: 0.5,
      stroke: '#000',
      'stroke-dasharray': 2,
      'stroke-width': 1,
      filter: null,
    }
  }))
  return $node.node()
}

function moveVirtualNode(d, $drager) {
  d.position.x += event.dx
  d.position.y += event.dy
  d.linkPoint.x += event.dx
  d.linkPoint.y += event.dy
  const translate = `translate(${d.position.x}, ${d.position.y})`
  $drager.setAttribute('transform', translate)
}

class Drag {
  constructor(options) {
    this._opts = options
    this._updateView = null
    this._$root = null
    this._drager = () => {}
  }

  create(updateNodes, updateEdges, $root) {
    this._updateView = d => {
      updateNodes('drag', d)
      updateEdges('drag', d)
    }
    this._$root = $root
    this._drager = this._initDrag()
  }

  bind(enable) {
    return this._drager
  }

  destroy() {
    this._drager.on('start', null).on('drag', null).on('end', null)
    this._opts = null
    this._drager = null
    this._$root = null
  }

  _initDrag() {
    const $root = this._$root.node()
    let $drager
    return drag().on('start', function(d) {
      if (d.drag.enable) {
        eventer.emit('drag.start', event, d)
        $drager = createVirtualNode(d, this)
        $root.appendChild($drager)
      }
    }).on('drag', d => {
      if (d.drag.enable) {
        moveVirtualNode(d, $drager)
        eventer.emit('drag.dragging', event, d)
      }
    }).on('end', d => {
      if (d.drag.enable) {
        $root.removeChild($drager)
        d.position.x += event.dx
        d.position.y += event.dy
        d.linkPoint.x += event.dx
        d.linkPoint.y += event.dy
        this._updateView(d)
        eventer.emit('drag.end', event, d)
      }
    })
  }
}

const dragger = new Drag()

export default dragger
