import {
  color
} from 'd3-color'
import {
  filter
} from './index'

function genData(d) {
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

export default function genShadowFilter(shadow) {
  shadow.style.id = genShadowId(shadow.style)
  shadow.hover.id = genShadowId(shadow.hover)
  filter.insert({
    genData,
    ...shadow.style
  })
  filter.insert({
    genData,
    ...shadow.hover
  })
  return {
    styleFilter: `url(#${shadow.style.id})`,
    hoverFilter: `url(#${shadow.hover.id})`
  }
}

  /*
  return {
    attr: {
      id: d.id,
      width: '200%',
      height: '200%',
      x: '-50%',
      y: '-50%',
    },
    subNodes: [{
      name: 'feGaussianBlur',
      attr: {
        in: 'SourceAlpha',
        stdDeviation: d.blur
      }
    }, {
      name: 'feOffset',
      attr: {
        dx: d.offsetX,
        dy: d.offsetY,
        result: 'offset'
      }
    }, {
      name: 'feFlood',
      attr: {
        'flood-color': d.color
      }
    }, {
      name: 'feComposite',
      attr: {
        in2: 'offset',
        operator: 'in',
      },
    }, {
      name: 'feMerge',
      subNodes: [{
        name: 'feMergeNode',
      }, {
        name: 'feMergeNode',
        attr: {
          in: 'SourceGraphic',
        }
      }]
    }]
  }
  */
