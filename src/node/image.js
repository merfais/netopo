import {
  merge
} from '../util.js'
import {
  calcLabelHeight
} from './index'

const dftOptions = {
  shape: {
    x: 0,
    y: 0,
    width: 30,
    height: 30,
    style: {
      cursor: 'pointer',
      fill: 'e8e8e8',
    },
    class: '',
    hover: {
      style: {
      },
      class: '',
    },
  },
  label: {
    x: null,      // 如果渲染时未提供，则置为 shape.x + shape.width / 2
    y: null,      // 如果渲染时未提供，则置为 shape.y + shape.height
    width: null,  // 如果渲染时未提供，则置为 100
    height: null,
    transform: null, // 如果渲染时未提供，则设置 translate(-shape.width / 2, 0)
    style: {
      display: 'flex',
      color: '#333',
      'justify-content': 'center',
      'word-break': 'break-all',
      'line-height': '1.2em',
      'padding-top': '5px',
      'letter-spacing': '0.1em',
      'font-size': '14px',
      'box-sizing': 'border-box',
    },
  }
}

function prepareLabel(d) {
  d.label = merge({}, dftOptions.label, d.label)
  if (d.label.x === null && d.label.y === null) {
    // 当未设置 x y 需要设置默认值
    d.label.x = d.shape.x + d.shape.width / 2
    d.label.y = d.shape.y + d.shape.height
  }
  if (d.label.width === null) {
    d.label.width = 100
  }
  if (d.label.height === null) {
    d.label.height = calcLabelHeight(d.label)
  }
  if (d.label.transform === null && _.isNumber(d.label.width)) {
    // 用于配合width使label居中
    d.label.transform = `translate(${-d.label.width / 2}, 0)`
  }
}

function calcLinkPoint(d) {
  const x = parseFloat(d.shape.x) || 0
  const y = parseFloat(d.shape.y) || 0
  const width = parseFloat(d.shape.width) || 0
  const height = parseFloat(d.shape.height) || 0
  d.linkPoint.x = d.linkPoint.x || x + width / 2
  d.linkPoint.y = d.linkPoint.y || y + height / 2
}

function prepareShape(d) {
  d.shape = merge({}, dftOptions.shape, d.shape)
  if (!_.has(d.shape, 'href')) {
    throw new Error('href is required when shape type is image')
  }
  if (!_.has(d.shape.hover, 'href')) {
    d.shape.hover.href = d.shape.href
  }
  calcLinkPoint(d)
}

function prepare(d) {
  prepareShape(d)
  prepareLabel(d)
}

export default {
  prepare,
}
