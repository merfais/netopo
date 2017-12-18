import {
  select,
  namespaces,
  // event,
} from 'd3-selection'
import options from '../options'
import {
  bind,
  merge,
} from '../util.js'
import bindHover from '../hover'
import {
  genPath,
  shapes,
} from './path.js'
import genShadowFilter from '../defs/shadow'

const dftOptions = {
  arrow: {}, // 暂不支持
  shadow: {
    enable: false,
  },
  tooltip: {
    _type: 'edge',
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
    const shadow = genShadowFilter(d.shadow)
    d.path.style.filter = shadow.styleFilter
  }
  const attr = { ...d.path }
  attr.id = d.id
  attr.d = genPath(d)
  // console.log(attr.d)
  const style = attr.style
  delete attr.style
  delete attr.hover
  return {
    attr,
    style,
  }
}

function renderEdge(d) {
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
  $edge2.call(bind(prop2)).call(bindHover('edge'))
  return {
    $edge,
    $edge2,
  }
}

export default function render($container, $container2, edges) {
  const edgeOpts = merge({}, dftOptions, options.edge)
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
    const { $edge, $edge2 } = renderEdge(d)
    $container.append(() => {
      return $edge.node()
    })
    return $edge2.node()
  })
}


/*
function renderEdge($g, d) {
  const attr = prepareAttr(d)
  $g.call(bindHover('edge'))
  const $path = $g.selectAll('path').remove().data([d]).enter()
  $path.append('path')
    .call(bind(attr))
  $path.append('path').call(bind({
    style: merge({}, attr.style, {
      opacity: 0,
      'stroke-width': d.path.hoverBoundarySpan,
      filter: null,
    }),
    attr: {
      id: attr.attr.id + '_boundary',
      d: attr.attr.d,
    }
  }))
}

export default function render($container, edges) {
  const edgeOpts = merge({}, DEFAULT.options, options.edge)
  // eslint-disable-next-line no-underscore-dangle
  const $edges = $container.selectAll('g').data(edges, d => d._id)
  $edges.exit().remove()
  $edges.enter().append(d => {
    if (!edgeType[d.type]) {
      d.type = DEFAULT.type
    }
    const $g = select(document.createElementNS(namespaces.svg, 'g'))
    _.forEach(edgeOpts, (item, key) => {
      d[key] = merge({}, item, d[key])
    })
    renderEdge($g, d)
    return $g.node()
  })
  return $edges
}
 *
 */
