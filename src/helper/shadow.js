import {
  color
} from 'd3-color'
import {
  merge
} from './util'

const dftOptions = {
  normal: {
    enable: true,
    offsetX: 2,
    offsetY: 2,
    blur: 3,
    color: 'rgba(0,0,0,.3)',
  },
  hover: {
    enable: true,
    offsetX: 2,
    offsetY: 2,
    blur: 3,
    color: 'rgba(0,0,0,.5)',
  },
}

function genFilter(d) {
  return {
    attr: {
      id: d.id,
      width: '200%',
      height: '200%',
      x: '-50%',
      y: '-50%',
    },
    subNodes: [{
      name: 'feDropShadow',
      attr: {
        dx: d.offsetX,
        dy: d.offsetY,
        stdDeviation: d.blur,
        'flood-color': d.color
      }
    }]
  }
}

function genShadowId(shadow) {
  const colorId = color(shadow.color) || {}
  return 'shadow'
    + (shadow.offsetX || '_')
    + (shadow.offsetY || '_')
    + (shadow.blur || '_')
    + (colorId.r || '_')
    + (colorId.g || '_')
    + (colorId.b || '_')
    + (colorId.opacity * 100 || '_')
}

export function genShadow(options, filter) {
  options.normal = merge({}, dftOptions.normal, options.normal)
  options.hover = merge({}, dftOptions.hover, options.normal)
  const shadow = {
    style: '',
    hover: '',
  }
  if (options.normal.enable) {
    options.normal.id = genShadowId(options.normal)
    filter.use(genFilter(options.normal))
    shadow.styleFilter = `url(#${options.normal.id})`
  }
  if (options.hover.enable) {
    options.hover.id = genShadowId(options.hover)
    filter.use(genFilter(options.hover))
    shadow.hoverFilter = `url(#${options.hover.id})`
  }
  return shadow
}
