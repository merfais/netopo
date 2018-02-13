import _ from 'lodash'
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
  shape: {
    total: 6,
    lines: [0],
  },
  path: {
    ...pathTheme,
  },
}

function genPoint(a, b, k, r) {
  if (k === 0) {
    /*
     * 直线方程是 y = c
     * 因此，x在变化，y不变
     */
    const a0 = a - r
    return r0 => {
      return {
        x: a0 + r0,
        y: b
      }
    }
  } else if (k === '') {
    /*
     * 直线方程是 x = c
     * 因此，x不变，y在变化
     */
    const b0 = b - r
    return r0 => {
      return {
        x: a,
        y: b0 + r0
      }
    }
  }
  /*
   * 直线方程 y = k * x + c
   * 相交圆方程 (x - a) ^ 2 + (y - b) ^2 = r ^ 2
   * 圆心(a, b)在直线上，因此 b = k * a + c
   * 联立求解可得出：
   * => (x - a) ^ 2 + [(k * x + c) - (k * a + c)] ^ 2 = r ^ 2
   * => (x - a) ^ 2 + [k * (x - a)] ^ 2 = r ^ 2
   * => (1 + k ^ 2) * (x - a) ^ 2 = r ^ 2
   * => x = a +|- [r / Math.sqrt(1 + k ^ 2)]
   * 根据 y = k * x + c, 则
   * => y = c + k * a +|- [ k * r / Math.sqrt(1 + k ^ 2)]
   *
   */
  // 点(a, b)所在直线的偏移常数c
  const c = b - a * k
  // 延x轴方向的一个交点(a0, b0)，公式是
  // x = a + [r / Math.sqrt(1 + k ^ 2)]
  const a0 = a + r / Math.sqrt(1 + k ** 2)
  // 以(a0, b0)为圆心，每段倍数做半径，计算每段的坐标，
  // 此条直线上其余各个点的坐标通过交点反向后求取，因此公式是
  // x = a - [r / Math.sqrt(1 + k ^ 2)]
  // y = c + k * a - [ k * r / Math.sqrt(1 + k ^ 2)]
  return r0 => {
    return {
      x: a0 - r0 / Math.sqrt(1 + k ** 2),
      y: c + k * a0 - k * r0 / Math.sqrt(1 + k ** 2)
    }
  }
}

function genPath(edge) {
  return ds => {
    const source = ds.nodeMap.get(edge.source) || {}
    const target = ds.nodeMap.get(edge.target) || {}
    const { x: x1, y: y1 } = source.linkPoint
    const { x: x2, y: y2 } = target.linkPoint
    // 相交圆半径，使用最小size的节点
    let srcR = Math.min(source.shape.width, source.shape.height) / 2
    let dstR = Math.min(target.shape.width, target.shape.height) / 2
    const r = Math.min(srcR, dstR)
    let k
    if (x2 === x1) {
      // 直线方程是 x = c, k = 无穷，则垂直相交直线 k = 0
      k = 0
    } else if (y2 === y1) {
      // 直线方程是 y = c, k = 0 则垂直相交直线 k = 无穷
      k = ''
    } else {
      // 求垂直相交线的斜率k
      k = -(x2 - x1) / (y2 - y1)
    }
    // 连线两个端点(x1, y1) | (x2, y2)分别充当圆心(a, b)做计算
    const genSrcPoint = genPoint(x1, y1, k, r)
    const genDstPoint = genPoint(x2, y2, k, r)
    // 直径切割份数,n条线，切分 n + 1 份
    const count = (edge.path.length + 1)
    const length = 2 * r / count
    const paths = []
    let i = 1
    while (i < count) {
      const r0 = i * length
      const src = genSrcPoint(r0)
      const dst = genDstPoint(r0)
      const d = path()
      d.moveTo(src.x, src.y)
      d.lineTo(dst.x, dst.y)
      paths.push(d.toString())
      i += 1
    }
    return paths
  }
}

function prepareData(d) {
  d.shape = merge({}, dftOptions.shape, d.shape)
  const map = new Map()
  let i = 0
  while (i < d.shape.total) {
    d.path[i] = merge({}, dftOptions.path, d.path[i])
    if (_.has(d.path[i], 'key')) {
      map.set(d.path[i].key, i)
    }
    i += 1
  }
  if (!_.isArray(d.shape.lines)) {
    throw new Error('shape.lines must be Array in multiLine')
  }
  d.path = d.shape.lines.map(val => {
    let i = map.size ? map.get(val) : val
    i = i === undefined ? val : i
    if (i >= d.shape.total) {
      throw new Error(`lines index: ${i + 1} larger than shape.total: ${d.shape.total}`)
    }
    return d.path[i]
  })
  d.genPath = genPath(d)
}

export default {
  prepareData
}
