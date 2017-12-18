function perMerge(target, source) {
  if (source === undefined) {
    return
  }
  if (_.isPlainObject(source) && _.isPlainObject(target)) {
    _.forEach(source, (item, key) => {
      if (_.isPlainObject(item)) {
        if (!_.isPlainObject(target[key])) {
          target[key] = {}
        }
        perMerge(target[key], item)
      } else {
        target[key] = item
      }
      /*
      if (_.isPlainObject(target[key])) {
        if (_.isPlainObject(item)) {
          perMerge(target[key], item)
        } else {
          target[key] = item
        }
      } else {
        if (_.isPlainObject(item)) {
          target[key] = {}
          perMerge(target[key], item)
        } else {
          target[key] = item
        }
      }
      */
    })
  } else {
    target = source
  }
}

export function merge(...params) {
  let i = 1
  while (i < params.length) {
    perMerge(params[0], params[i])
    i += 1
  }
  return params[0]
}

export function exportFn(module, keys) {
  const rst = {}
  keys.forEach(key => {
    rst[key] = (...params) => {
      return module[key](...params)
    }
  })
  return rst
}

export function bindAttr(attr) {
  return $selector => {
    _.forEach(attr, (value, key) => {
      $selector.attr(key, value)
    })
    return $selector
  }
}

export function bindStyle(style) {
  return $selector => {
    _.forEach(style, (value, key) => {
      $selector.style(key, value)
    })
    return $selector
  }
}

export function bind(data) {
  return $selector => {
    bindAttr(data.attr)($selector)
    bindStyle(data.style)($selector)
    return $selector
  }
}

export function pixeled(source) {
  const target = {}
  _.forEach(source, (val, key) => {
    target[key] = val + 'px'
  })
  return target
}

export function parseTranform(transform) {
  transform = transform || ''
  const translateReg = /translate\((-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\)/
  const scaleReg = /scale\((-?\d+\.?\d*)\)/
  const translate = transform.match(translateReg)
  let x = 0
  let y = 0
  let k = 1
  if (translate) {
    x = +translate[1]
    y = +translate[2]
  }
  const scale = transform.match(scaleReg)
  if (scale) {
    k = +scale[1]
  }
  return { x, y, k }
}

export function getInverseRect(svgEl, transform) {
  // svg元素无offset属性，无法直接获取相对位置
  // 通过转化屏幕坐标系获取相对位置
  // 参考 https://stackoverflow.com/questions/26049488/how-to-get-absolute-coordinates-of-object-inside-a-g-group
  const rect = svgEl.getBoundingClientRect()
  const ctm = svgEl.getScreenCTM().inverse()
  const cx = ctm.e + rect.x * ctm.a + rect.y * ctm.c - rect.x
  const cy = ctm.f + rect.x * ctm.b + rect.y * ctm.d - rect.y
  rect.x += cx
  rect.y += cy
  if (transform) {
    rect.x += transform.x
    rect.y += transform.y
  }
  // getBoundingClientRect 返回的是DOMRect类型，
  // 为方便操作转换成Object类型
  return {
    x: rect.x,
    y: rect.y,
    left: rect.left,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height,
  }
}

/**
 * 生成UUID
 *
 * @name uuid
 * @function
 * @returns {string} UUID
 */
export function uuid() {
  let S4 = function() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  }
  return `${S4()}${S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()}`
}

/*
export function bindAttr(prepareData, dft) {
  return $selector => {
    let data = prepareData
    if (_.isFunction(prepareData)) {
      $selector.attr('data-calc', d => {
        data = prepareData(d, dft)
        return null
      })
    }
    _.forEach(data.attr, (value, key) => {
      $selector.attr(key, value)
    })
    _.forEach(data.style, (value, key) => {
      $selector.style(key, value)
    })
    return $selector
  }
}


function bind(type, dataKey, default) {
  return $selector => {
    let data = {}
    $selector[type]('data-calc', d => {
      const source = _.get(d, [dataKey, type])
      const target = _.get(default, [dataKey, type])
      data = merge({}, target, source)
      return null
    })
    _.forEach(data, (key, value) => {
      $selector[type](key, value)
    })
    return $selector
  }
}

export function bindAttr(dataKey, default) {
  return bind('attr', dataKey, default)
}

export function bindStyle(dataKey, default) {
  return bind('style', dataKey, default)
}

function prepareMerge(...params) {
  return (default, data) => {
    const source = _.get(data, params)
    const target = _.get(default, params)
    return merge({}, target, source)
  }
}

function genBind(type) {
  return ($selector, getData) => {
    let data = {}
    $selector[type]('data-calc', d => {
      data = getData(d)
      return null
    })
    _.forEach(data, (key, value) => {
      $selector[type](key, value)
    })
    return $selector
  }
}

export function bindAttr(dataKey, default) {
  const set = genBind('attr')
  const mergeData = prepareMerge(dataKey, 'attr')
  return $selector => {
    return set($selector, d => {
      return mergeData(default, d)
    })
  }
}

export function bindStyle(dataKey, default) {
  const set = genBind('style')
  const mergeData = prepareMerge(dataKey, 'style')
  return $selector => {
    return set($selector, d => {
      return mergeData(default, d)
    })
  }
}
*/
