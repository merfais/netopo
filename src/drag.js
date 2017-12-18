import {
  event,
  select,
} from 'd3-selection'
import {
  drag
} from 'd3-drag'
import {
  genPath
} from './edge/path'
import tooltip from './tooltip'
import thumbnails from './thumbnails'
import {
  bind,
} from './util'

function updateView(d, $root) {
  d.position.x += event.dx
  d.position.y += event.dy
  d.linkPoint.x += event.dx
  d.linkPoint.y += event.dy
  const translate = `translate(${d.position.x}, ${d.position.y})`
  $root = select($root)
  $root.select(`#${d.id}`).attr('transform', translate)
  $root.select(`#${d.id}_cover`).attr('transform', translate)
  // eslint-disable-next-line no-underscore-dangle
  _.forEach(d._edges, edge => {
    const path = genPath(edge.id)
    $root.select(`#${edge.id}`).attr('d', path)
    $root.select(`#${edge.id}_cover`).attr('d', path)
  })
}

function createVirtualNode(d, node) {
  const $root = node.parentNode.parentNode.parentNode
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
  $root.appendChild($node.node())
  return $root
}

function destroyVirtualNode($root) {
  $root.removeChild(document.getElementById('dragger'))
}

function moveVirtualNode(d, $root) {
  d.position.x += event.dx
  d.position.y += event.dy
  d.linkPoint.x += event.dx
  d.linkPoint.y += event.dy
  const translate = `translate(${d.position.x}, ${d.position.y})`
  $root.querySelector('#dragger').setAttribute('transform', translate)
}

class Drag {
  constructor(options) {
    this._opts = options
    this._drager = this._initDrag()
  }

  bind(enable) {
    if (enable !== false) {
      return this._drager
    }
  }

  destroy() {
    this._drager.on('start', null).on('drag', null).on('end', null)
    this._opts = null
  }

  _initDrag() {
    let $root
    return drag().on('start', function(d) {
      $root = createVirtualNode(d, this)
    }).on('drag', d => {
      tooltip.hide()
      moveVirtualNode(d, $root)
    }).on('end', d => {
      destroyVirtualNode($root)
      updateView(d, $root)
      thumbnails.update()
    })
  }
}

const dragger = new Drag()

export default dragger

/*

export default function bindDrag($selector, options) {
  if (options.enable) {
    const tmp = drag()
      .on('start', handleDragStart)
      .on('drag', handleDrag)
      .on('end', handleDragEnd)
    $selector.call(tmp)
  }
}
function handleDragStart(d) {
  createVirtualNode(d)
}

function handleDrag(d) {
  tooltip.hide()
  moveVirtualNode(d)
}

function handleDragEnd(d) {
  destroyVirtualNode()
  update(d)
}

 *
 */
