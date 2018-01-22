import {
  merge
} from '../helper'
import {
  textTheme
} from './theme'

const dftOptions = {
  shape: {
    x: 0,
    y: 0,
    rx: 5,
    ry: 5,
    width: null,
    height: null,
    ...textTheme.shape,
  },
  label: {
    x: 0,
    y: 0,
    width: 100,
    height: null,
    ...textTheme.label,
  }
}

function calcLinkPoint(d) {
  const x = parseFloat(d.label.x) || 0
  const y = parseFloat(d.label.y) || 0
  const width = parseFloat(d.label.width) || 0
  const height = parseFloat(d.label.height) || 0
  d.linkPoint.x = d.linkPoint.x || x + width / 2
  d.linkPoint.y = d.linkPoint.y || y + height / 2
}

function prepareLabel(d, calcLabelHeight) {
  d.label = merge({}, dftOptions.label, d.label)
  if (d.label.height === null) {
    d.label.height = calcLabelHeight(d.label)
  }
}

function prepareShape(d) {
  d.shape = merge({}, dftOptions.shape, d.shape)
  if (d.shape.height === null) {
    d.shape.height = d.label.height
  }
  if (d.shape.width === null) {
    d.shape.width = d.label.width
  }
  calcLinkPoint(d)
}

function prepareData(d, calcLabelHeight) {
  prepareLabel(d, calcLabelHeight)
  prepareShape(d)
}


export default {
  prepareData,
}
