import {
  select,
  namespaces,
} from 'd3-selection'
import options from '../options'
import ds from '../dataSet'
import {
  bind,
  merge,
} from '../util.js'
import {
  bindHover,
  unBindHover,
} from '../hover'
import {
  genPath,
  shapes,
} from './path.js'
import shadow from '../defs/shadow'

const dftOptions = {
  arrow: {}, // 暂不支持
  shadow: {
    enable: false,  // edge shadow有非常大的性能问题，慎用
  },
  tooltip: {
    enable: true,
  },
  path: {
    hoverBoundarySpan: 10,
    style: {
      stroke: '#337ab7',
      'stroke-width': 2,
      cursor: 'pointer',
    },
    class: '',
    hover: {
      style: {
        stroke: '#5bc0de',
        'stroke-width': 3
      },
      class: '',
    }
  }
}

function prepareProp(d) {
  if (d.shadow.enable !== false) {
    // FIXME: 开启filter会有性能问题
    shadow.create(d.shadow)
    d.path.style.filter = shadow.styleFilter
    d.path.hover.style.filter = shadow.hoverFilter
  }
  const attr = { ...d.path }
  attr.id = d.id
  attr.d = genPath(d)
  const style = attr.style
  delete attr.style
  delete attr.hover
  return {
    attr,
    style,
  }
}

function renderEdge(d, $parent) {
  const prop = prepareProp(d)
  const prop2 = {
    style: merge({}, prop.style, {
      opacity: 0,
      'stroke-width': d.path.hoverBoundarySpan,
      filter: null,
    }),
    attr: {
      id: prop.attr.id + '_cover',
      d: prop.attr.d,
    }
  }
  const $edge = select(document.createElementNS(namespaces.svg, 'path'))
  $edge.call(bind(prop))
  const $edge2 = select(document.createElementNS(namespaces.svg, 'path'))
  $edge2.call(bind(prop2)).call(bindHover('edge', $parent))
  return {
    $edge,
    $edge2,
  }
}

export function updateEdgesPosition($container, $container2) {
  return (type, d) => {
    if (type === 'tick') {
      _.forEach(ds.edges, d => {
        $container.select(`#${d.id}`).attr('d', genPath(d))
      })
    } else if (type === 'end') {
      $container2.selectAll('path').attr('d', d => {
        return genPath(d)
      })
    } else if (type === 'drag') {
      if (!_.has(d, '_edges')) {
        throw new Error('edges info connect of node is lost')
      }
      // eslint-disable-next-line no-underscore-dangle
      _.forEach(d._edges, edge => {
        const path = genPath(edge.id)
        $container.select(`#${edge.id}`).attr('d', path)
        $container2.select(`#${edge.id}_cover`).attr('d', path)
      })
    }
  }
}

export function renderEdges($container, $container2) {
  const edgeOpts = merge({}, dftOptions, options.edge)
  const edges = ds.change.edges
  if (edges.length) {
    $container.selectAll('path').remove()
    const $edges2 = $container2.selectAll('path').remove()
    // eslint-disable-next-line no-underscore-dangle
    $edges2.data(edges, d => d._id).enter().append(d => {
      if (shapes.indexOf(d.type) === -1) {
        d.type = 'line'
      }
      _.forEach(edgeOpts, (item, key) => {
        d[key] = merge({}, item, d[key])
      })
      const { $edge, $edge2 } = renderEdge(d, $container)
      $container.append(() => {
        return $edge.node()
      })
      return $edge2.node()
    })
  }
}

export function destroyEdges($container, $container2) {
  $container2.selectAll('path').property('_destroy', function() {
    select(this).call(unBindHover())
  })
  $container2.remove()
  $container.remove()
}
