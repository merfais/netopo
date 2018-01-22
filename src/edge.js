import {
  select,
  namespaces,
} from 'd3-selection'
import {
  bind,
  merge,
  setNull,
} from './helper'
import {
  genEdgeProp,
} from './shape'

function events($parent, eventer, tooltip) {
  return {
    mouseenter(d, ...args) {
      $parent.select(`#${d.id}`).call(bind(d.path.hover))
      tooltip.show(d)
      eventer.emit('edge.hover', d, ...args)
    },
    mouseleave(d) {
      const prop = merge(setNull(d.path.hover), {
        style: d.path.style,
        class: d.path.class,
      })
      $parent.select(`#${d.id}`).call(bind(prop))
      tooltip.hide()
    },
    mousemove(d) {
      tooltip.update()
    },
    click(...args) {
      eventer.emit('edge.click', ...args)
    }
  }
}

function genPath(edge, ds) {
  if (typeof edge === 'string') {
    edge = ds.edgeMap.get(edge)
  }
  if (edge) {
    const source = ds.nodeMap.get(edge.source) || {}
    const target = ds.nodeMap.get(edge.target)
    const { x: x1, y: y1 } = source.linkPoint
    const { x: x2, y: y2 } = target.linkPoint
    return edge.genPath(x1, y1, x2, y2)
  }
  return ''
}

function renderEdge({
  $edgeContainer,
  $edgeContainer2,
  isUpdate,
  edge,
  ds,
  filter,
  eventer,
  tooltip,
}) {
  const { prop, prop2 } = genEdgeProp(edge, filter)
  const path = genPath(edge, ds)
  edge.id2 = edge.id + '_cover'
  prop.attr.id = edge.id
  prop2.attr.id = edge.id2
  prop.attr.d = path
  prop2.attr.d = path
  const eventHandler = eventer.bind(events($edgeContainer, eventer, tooltip))
  let $edge
  let $edge2
  if (isUpdate) {
    $edge = $edgeContainer.select(`#${prop.attr.id}`)
    $edge2 = $edgeContainer2.select(`#${prop2.attr.id}`)
  } else {
    $edge = select(document.createElementNS(namespaces.svg, 'path'))
    $edge2 = select(document.createElementNS(namespaces.svg, 'path'))
  }
  /* eslint-disable no-underscore-dangle */
  $edge.node().__data__ = edge
  $edge2.node().__data__ = edge
  /* eslint-enable no-underscore-dangle */
  $edge.call(bind(prop))
  $edge2.call(bind(prop2)).call(eventHandler)
  if (!isUpdate) {
    $edgeContainer.append(() => $edge.node())
    $edgeContainer2.append(() => $edge2.node())
  }
}

function destroyEdge(edge, eventer) {
  select(edge).call(eventer.unBind(events()))
}

export function updateEdges({
  ds,
  $edgeContainer,
  $edgeContainer2,
}) {
  return (type, d) => {
    if (type === 'tick') {
      _.forEach(ds.edges, edge => {
        $edgeContainer
          .select(`#${edge.id}`)
          .attr('d', genPath(edge, ds))
      })
    } else if (type === 'end') {
      $edgeContainer2.selectAll('path').attr('d', d => {
        return genPath(d, ds)
      })
    } else if (type === 'drag') {
      if (!_.has(d, '_edges')) {
        throw new Error('edges info connect of node is lost')
      }
      // eslint-disable-next-line no-underscore-dangle
      _.forEach(d._edges, edgeId => {
        const path = genPath(edgeId, ds)
        $edgeContainer.select(`#${edgeId}`).attr('d', path)
        $edgeContainer2.select(`#${edgeId}_cover`).attr('d', path)
      })
    }
  }
}

export function renderEdges({
  $edgeContainer,
  $edgeContainer2,
  ds,
  options,
  tooltip,
  filter,
  eventer,
}) {
  const enterEdges = ds.enterEdges
  const updateEdges = ds.updateEdges
  const exitEdges = ds.exitEdges
  _.forEach(exitEdges, edge => {
    $edgeContainer.select(`#${edge.id}`).remove()
    $edgeContainer2.select(`#${edge.id2}`).remove()
  })
  _.forEach(updateEdges, edge => {
    _.forEach(options.edge, (item, key) => {
      if (_.isPlainObject(item)) {
        edge[key] = merge({}, item, edge[key])
      } else if (!_.has(edge, key)) {
        edge[key] = item
      }
    })
    renderEdge({
      $edgeContainer,
      $edgeContainer2,
      isUpdate: true,
      edge,
      ds,
      filter,
      eventer,
      tooltip,
    })
  })
  _.forEach(enterEdges, edge => {
    _.forEach(options.edge, (item, key) => {
      if (_.isPlainObject(item)) {
        edge[key] = merge({}, item, edge[key])
      } else if (!_.has(edge, key)) {
        edge[key] = item
      }
    })
    renderEdge({
      $edgeContainer,
      $edgeContainer2,
      isUpdate: false,
      edge,
      ds,
      filter,
      eventer,
      tooltip,
    })
  })
}

export function destroyEdges({
  $edgeContainer2,
  eventer
}) {
  $edgeContainer2.selectAll('path').property('_destroy', function() {
    destroyEdge(this, eventer)
  })
}
