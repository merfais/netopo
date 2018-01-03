import {
  color
} from 'd3-color'
import filter from './index'
import options from '../options'
import {
  merge
} from '../util'

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

class Shadow {
  constructor(options) {
    this._opts = options
    this._styleFilter = ''
    this._hoverFilter = ''
  }

  create(shadow) {
    shadow.normal = merge({}, this._opts.normal, shadow.normal)
    shadow.hover = merge({}, this._opts.hover, shadow.normal)
    if (shadow.normal.enable) {
      shadow.normal.id = genShadowId(shadow.normal)
      filter.use(genFilter(shadow.normal))
      this._styleFilter = `url(#${shadow.normal.id})`
    }
    if (shadow.hover.enable) {
      shadow.hover.id = genShadowId(shadow.hover)
      filter.use(genFilter(shadow.hover))
      this._hoverFilter = `url(#${shadow.hover.id})`
    }
  }

  get styleFilter() {
    return this._styleFilter
  }

  get hoverFilter() {
    return this._hoverFilter
  }
}

options.shadow = merge({}, dftOptions, options.shadow)
const shadow = new Shadow(options.shadow)

export default shadow
