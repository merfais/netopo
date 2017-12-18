import {
  merge
} from '../util.js'

const DEFAULT = {
  get shape() {
    return {
      r: 20,
      cx: null,     // 如果渲染时未提供，则置为r
      cy: null,     // 如果渲染时未提供，则置为r
      style: {
        cursor: 'pointer',
        stroke: '#666',
        'stroke-width': 0.8,
        fill: 'e8e8e8',
      },
      class: '',
      hover: {
        style: {
          stroke: '#777',
          fill: '#eee',
        },
        class: '',
      },
    }
  },
  get label() {
    return {
      x: null,  // 如果未提供，则置为 shape.cx
      y: null,  // 如果未提供，则置为 shape.cy + shape.r
      width: null, // 如果渲染时未提供，则置为 100
      transform: null, // 如果渲染时未提供，则设置 translate(-50, 0)
      style: {
        display: 'flex',
        'justify-content': 'center',
        'word-break': 'break-all',
        'line-height': '1.2em',
        'padding-top': '5px',
        'letter-spacing': '0.1em',
        color: '#333',
      },
      hover: {},
    }
  }
}

function label(d, options) {
  d.label = merge({}, DEFAULT.label, options, d.label)
  if (d.label.x === null && d.label.y === null) {
    // 当未设置 x y 需要设置默认值
    d.label.x = d.shape.cx
    d.label.y = d.shape.cy + d.shape.r
  }
  if (d.label.width === null) {
    d.label.width = 100
  }
  if (d.label.transform === null && _.isNumber(d.label.width)) {
    // 用于配合width使label居中
    d.label.transform = `translate(${-d.label.width / 2}, 0)`
  }
}

function calcLinkPoint(d) {
  d.linkPoint.x = d.linkPoint.x || parseFloat(d.shape.cx) || 0
  d.linkPoint.y = d.linkPoint.y || parseFloat(d.shape.cy) || 0
}

function shape(d, options) {
  d.shape = merge({}, DEFAULT.shape, options, d.shape)
  if (d.shape.cx === null && d.shape.cy === null) {
    // 当未提供 cx cy 需要设置默认值
    d.shape.cx = d.shape.r
    d.shape.cy = d.shape.r
  }
  calcLinkPoint(d)
}

export default {
  shape,
  label
}