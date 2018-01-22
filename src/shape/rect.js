import {
  merge
} from '../helper'
import {
  rectTheme
} from './theme'

const dftOptions = {
  shape: {
    x: 0,
    y: 0,
    rx: 5,
    ry: 5,
    width: 100,
    height: 36,
    ...rectTheme.shape,
  },
  label: {
    x: 0,
    y: 0,
    width: 100,
    height: 30,
    ...rectTheme.label,
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
  calcLinkPoint(d)
}

function prepareLabel(d) {
  const wh = {
    width: _.get(d.shape, 'width', dftOptions.shape.width),
    height: _.get(d.shape, 'height', dftOptions.shape.height)
  }
  d.label = merge({}, dftOptions.label, wh, d.label)
}

function prepareData(d) {
  prepareShape(d)
  prepareLabel(d)
}

export default {
  prepareData,
}
