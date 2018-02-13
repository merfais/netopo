import _ from 'lodash'
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

function events($parent, eventer, tooltip, index) {
  return {
    mouseenter(d, ...args) {
      _.forEach($parent.selectAll('path').nodes(), (path, i) => {
        if (index === i) {
          select(path).call(bind(d.path[i].hover))
        }
      })
      if (_.has(d.shape, 'lines')) {  // 如果有多条线
        d.hoverTarget = {
          index,
          name: d.shape.lines[index]
        }
      }
      tooltip.show(d)
      eventer.emit('edge.hover', d, ...args)
    },
    mouseleave(d) {
      _.forEach($parent.selectAll('path').nodes(), (path, i) => {
        if (index === i) {
          const prop = merge(setNull(d.path[i].hover), {
            style: d.path[i].style,
            class: d.path[i].class,
          })
          select(path).call(bind(prop))
        }
      })
      tooltip.hide()
    },
    mousemove(d) {
      tooltip.update()
    },
    click(d, ...args) {
      if (_.has(d.shape, 'lines')) {  // 如果有多条线
        d.clickTarget = {
          index,
          name: d.shape.lines[index],
        }
      }
      eventer.emit('edge.click', d, ...args)
    }
  }
}

function prepareEdge(d, filter, ds) {
  const { pathProp, pathProp2 } = genEdgeProp(d, filter)
  d.id2 = d.id + '_cover'
  const edgeProp = { attr: { id: d.id } }
  const edgeProp2 = { attr: { id: d.id2 } }
  d.genPath(ds).forEach((d, i) => {
    pathProp[i].attr.d = d
    pathProp2[i].attr.d = d
  })
  return {
    pathProp,
    pathProp2,
    edgeProp,
    edgeProp2,
  }
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
  const {
    pathProp,
    pathProp2,
    edgeProp,
    edgeProp2,
  } = prepareEdge(edge, filter, ds)
  let $edge
  let $edge2
  if (isUpdate) {
    $edge = $edgeContainer.select(`#${edgeProp.attr.id}`)
    $edge2 = $edgeContainer2.select(`#${edgeProp2.attr.id}`)
    $edge.html(null)
    $edge.html(null)
  } else {
    $edge = select(document.createElementNS(namespaces.svg, 'g'))
    $edge2 = select(document.createElementNS(namespaces.svg, 'g'))
  }
  let i = 0
  while (i < pathProp.length) {
    const path = document.createElementNS(namespaces.svg, 'path')
    const path2 = document.createElementNS(namespaces.svg, 'path')
    const eventHandler = eventer.bind(events($edge, eventer, tooltip, i))
    select(path).call(bind(pathProp[i]))
    select(path2).call(bind(pathProp2[i])).call(eventHandler).data([edge])
    $edge.append(() => path)
    $edge2.append(() => path2)
    i += 1
  }
  $edge.call(bind(edgeProp))
  $edge2.call(bind(edgeProp2))
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
        const paths = edge.genPath(ds)
        $edgeContainer.selectAll(`#${edge.id} path`).attr('d', (d, i) => {
          return paths[i]
        })
      })
    } else if (type === 'end') {
      _.forEach(ds.edges, edge => {
        const paths = edge.genPath(ds)
        $edgeContainer2.selectAll(`#${edge.id2} path`).attr('d', (d, i) => {
          return paths[i]
        })
      })
    } else if (type === 'drag') {
      if (!_.has(d, '_edges')) {
        throw new Error('edges info connect of node is lost')
      }
      // eslint-disable-next-line no-underscore-dangle
      _.forEach(d._edges, edgeId => {
        const edge = ds.edgeMap.get(edgeId)
        const paths = edge.genPath(ds)
        const path = $edgeContainer.selectAll(`#${edge.id} path`).nodes()
        const path2 = $edgeContainer2.selectAll(`#${edge.id2} path`).nodes()
        paths.forEach((d, i) => {
          path[i].setAttribute('d', d)
          path2[i].setAttribute('d', d)
        })
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
