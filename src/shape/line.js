import {
  path
} from 'd3-path'
import {
  merge
} from '../helper'
import {
  pathTheme
} from './theme'

const dftOptions = {
  path: {
    ...pathTheme,
  },
}

function genPath(x1, y1, x2, y2) {
  const d = path()
  d.moveTo(x1, y1)
  d.lineTo(x2, y2)
  return d
}

function prepareData(d) {
  d.path = merge({}, dftOptions.path, d.path)
  d.genPath = genPath
}

export default {
  prepareData
}
