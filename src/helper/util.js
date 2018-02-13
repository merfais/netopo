import _ from 'lodash'

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

export function setNull(target) {
  let rtn = {}
  _.forEach(target, (item, key) => {
    if (_.isObject(item)) {
      rtn[key] = setNull(item)
    } else {
      rtn[key] = null
    }
  })
  return rtn
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

export function bindClass(klass) {
  const classes = {}
  if (klass) {
    if (_.isString(klass)) {
      klass.replace(/\s+/g, ',').split(',').forEach(item => {
        classes[item] = true
      })
    } else if (_.isObject(klass)) {
      _.forEach(klass, (value, key) => {
        key.replace(/\s+/g, ',').split(',').forEach(item => {
          classes[item] = value
        })
      })
    } else {
      throw new Error('class type must be string or object')
    }
  }
  return $selector => {
    _.forEach(classes, (value, key) => {
      $selector.classed(key, value)
    })
    return $selector
  }
}

export function bind(data) {
  return $selector => {
    const style = data.style
    const classes = data.class
    let attr = data.attr
    if (!attr) {
      const tmp = { ...data }
      delete tmp.style
      delete tmp.class
      delete tmp.attr
      attr = tmp
    }
    bindAttr(attr)($selector)
    bindStyle(style)($selector)
    bindClass(classes)($selector)
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

export function getSvgRect(svgEl, transform, scale = 1) {
  // svg元素无offset属性，无法直接获取相对位置
  // 通过转化屏幕坐标系获取相对位置
  // 参考 https://stackoverflow.com/questions/26049488/how-to-get-absolute-coordinates-of-object-inside-a-g-group
  const rect = svgEl.getBoundingClientRect()
  const ctm = svgEl.getScreenCTM().inverse()
  rect.x = ctm.e + rect.x * ctm.a + rect.y * ctm.c
  rect.y = ctm.f + rect.x * ctm.b + rect.y * ctm.d
  if (transform) {
    rect.x = rect.x * transform.k + transform.x
    rect.y = rect.y * transform.k + transform.y
  }
  if (scale !== 1) {
    rect.x -= rect.width * (scale - 1) / 2
    rect.y -= rect.height * (scale - 1) / 2
    rect.width *= scale
    rect.height *= scale
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

let running = false
let throttleFunc = function() {
  if (running) {
    return
  }
  running = true
  requestAnimationFrame(() => {
    window.dispatchEvent(new CustomEvent('optimizedResize'))
    running = false
  })
}
export function onRezie(handler) {
  window.addEventListener('resize', throttleFunc)
  window.addEventListener('optimizedResize', handler)
}

export function offResize(handler) {
  window.removeEventListener('resize', throttleFunc)
  window.removeEventListener('optimizedResize', handler)
}
