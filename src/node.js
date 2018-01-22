import {
  select,
  namespaces,
} from 'd3-selection'
import {
  bind,
  bindStyle,
  bindAttr,
  merge,
  setNull,
} from './helper'
import {
  genNodeProp,
} from './shape'

function events($parent, eventer, tooltip) {
  return {
    mouseenter(d, ...args) {
      let id = `#${d.id}_shape`
      let attr = 'shape'
      if (d.shape.type === 'text') {
        id = 'div'
        attr = 'label'
      }
      $parent.select(id).call(bind(d[attr].hover))
      tooltip.show(d)
      eventer.emit('node.hover', d, ...args)
    },
    mouseleave(d) {
      let id = `#${d.id}_shape`
      let attr = 'shape'
      if (d.shape.type === 'text') {
        id = 'div'
        attr = 'label'
      }
      const prop = merge(setNull(d[attr].hover), {
        style: d[attr].style,
        class: d[attr].class,
      })
      const $shape = $parent.select(id)
      $shape.call(bind(prop))
      if (d.shape.type === 'image') {
        $shape.attr('href', d.shape.href)
      }
      tooltip.hide()
    },
    mousemove(d) {
      tooltip.update()
    },
    click(...args) {
      eventer.emit('node.click', ...args)
    },
  }
}

function prepareNode(d, filter, calcLabelHeight) {
  const { shapeProp, labelProp } = genNodeProp(d, filter, calcLabelHeight)
  d.position = merge({ x: 0, y: 0 }, d.position)
  d.linkPoint.x += d.position.x
  d.linkPoint.y += d.position.y
  d.id2 = d.id + '_cover'
  const attr = {
    id: d.id,
    transform: `translate(${d.position.x}, ${d.position.y})`,
  }
  const style = { ...d.style }
  const nodeProp = {
    attr,
    style,
  }
  const nodeProp2 = {
    style,
    attr: merge({}, attr, {
      id: d.id2,
    })
  }
  return {
    shapeProp: shapeProp.prop,
    shapeProp2: shapeProp.prop2,
    labelProp,
    nodeProp,
    nodeProp2,
  }
}

export function renderNode({
  $nodeContainer,
  $nodeContainer2,
  isUpdate,
  node,
  drag,
  filter,
  eventer,
  tooltip,
  calcLabelHeight
}) {
  const {
    shapeProp,
    shapeProp2,
    labelProp,
    nodeProp,
    nodeProp2,
  } = prepareNode(node, filter, calcLabelHeight)
  let $node
  let $node2
  let $shape
  let $shape2
  let $label
  if (isUpdate) {
    $node = $nodeContainer.select(`#${nodeProp.attr.id}`)
    $node2 = $nodeContainer2.select(`#${nodeProp2.attr.id}`)
    $shape = $nodeContainer.select(`#${nodeProp.attr.id} ${shapeProp.type}`)
    $shape2 = $nodeContainer2.select(`#${nodeProp2.attr.id} ${shapeProp2.type}`)
    $label = $nodeContainer.select(`#${nodeProp.attr.id} foreignObject`)
  } else {
    $node = select(document.createElementNS(namespaces.svg, 'g'))
    $node2 = select(document.createElementNS(namespaces.svg, 'g'))
    $shape = $node.append(shapeProp.type)
    $shape2 = $node2.append(shapeProp2.type)
    $label = $node.append('foreignObject')
    $label.append('xhtml:div')
  }
  const eventHandler = eventer.bind(events($node, eventer, tooltip))
  /* eslint-disable no-underscore-dangle */
  $node2.node().__data__ = node
  $shape2.node().__data__ = node
  /* eslint-enable no-underscore-dangle */
  if (!_.isEmpty(shapeProp)) {
    $shape.call(bind(shapeProp))
  }
  if (!_.isEmpty(shapeProp2)) {
    $shape2
      .call(bind(shapeProp2))
      .call(eventHandler)
      .call(drag.bind(node.drag))
  }
  if (!_.isEmpty(labelProp)) {
    $label
      .call(bindAttr(labelProp.attr))
      .select('div')
      .call(bindStyle(labelProp.style))
      .html(labelProp.text)
  }
  $node.call(bind(nodeProp))
  $node2.call(bind(nodeProp2))
  if (!isUpdate) {
    $nodeContainer.append(() => $node.node())
    $nodeContainer2.append(() => $node2.node())
  }
}

function destroyNode(node, eventer) {
  select(node).call(eventer.unBind(events()))
}

export function updateNodes({
  ds,
  $nodeContainer,
  $nodeContainer2,
}) {
  return (type, d) => {
    if (type === 'tick') {
      _.forEach(ds.nodes, node => {
        node.linkPoint.x += node.x - node.position.x
        node.linkPoint.y += node.y - node.position.y
        node.position.x = node.x
        node.position.y = node.y
        const transform = `translate(${node.position.x}, ${node.position.y})`
        $nodeContainer.select(`#${node.id}`).attr('transform', transform)
      })
    } else if (type === 'end') {
      $nodeContainer2.selectAll('g').attr('transform', d => {
        if (!_.has(d, 'position')) {
          throw new Error('data.position is required')
        }
        return `translate(${d.position.x}, ${d.position.y})`
      })
    } else if (type === 'drag') {
      if (!_.has(d, 'position')) {
        throw new Error('data.position is required')
      }
      const translate = `translate(${d.position.x}, ${d.position.y})`
      $nodeContainer.select(`#${d.id}`).attr('transform', translate)
      $nodeContainer2.select(`#${d.id}_cover`).attr('transform', translate)
    }
  }
}

export function renderNodes({
  options,
  $nodeContainer,
  $nodeContainer2,
  ds,
  drag,
  tooltip,
  filter,
  eventer,
  calcLabelHeight,
}) {
  const enterNodes = ds.enterNodes
  const updateNodes = ds.updateNodes
  const exitNodes = ds.exitNodes
  _.forEach(exitNodes, node => {
    $nodeContainer.select(`#${node.id}`).remove()
    $nodeContainer2.select(`#${node.id2}`).remove()
  })
  _.forEach(updateNodes, node => {
    _.forEach(options.node, (item, key) => {
      node[key] = merge({}, item, node[key])
    })
    renderNode({
      $nodeContainer,
      $nodeContainer2,
      isUpdate: true,
      node,
      drag,
      filter,
      eventer,
      tooltip,
      calcLabelHeight,
    })
  })
  _.forEach(enterNodes, node => {
    _.forEach(options.node, (item, key) => {
      node[key] = merge({}, item, node[key])
    })
    renderNode({
      $nodeContainer,
      $nodeContainer2,
      isUpdate: false,
      node,
      drag,
      filter,
      eventer,
      tooltip,
      calcLabelHeight
    })
  })
}

export function destroyNodes({
  $nodeContainer2,
  eventer
}) {
  $nodeContainer2.selectAll('g').property('_destroy', function() {
    destroyNode(this.firstChild, eventer)
  })
}
