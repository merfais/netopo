const eventMap = new Map()

const eventer = {
  // 外部注册事件
  on(name, handler) {
    if (eventMap.has(name)) {
      eventMap.get(name).push(handler)
    } else {
      eventMap.set(name, [handler])
    }
  },
  // 外部释放事件
  off(name, handler) {
    // TODO
  },
  // 对外派发事件，触发外部 on 注册的事件回调
  emit(name, ...paramters) {
    _.forEach(eventMap.get(name), handler => {
      handler(...paramters)
    })
  },
  // 对内部 $selector 注册事件
  bind(handlers) {
    return $selector => {
      _.forEach(handlers, (handler, name) => {
        $selector.on(name, function(...paramters) {
          // d3 event 回调中this有特殊的含义，需要将this传递下去
          // 因此不能使用箭头函数
          handler.call(this, ...paramters, $selector)
        })
      })
    }
  },
  // 对内部 $selector 解绑事件
  unBind(handlers) {
    return $selector => {
      _.forEach(handlers, (handler, name) => {
        $selector.on(name, null)
      })
    }
  }
}

export default eventer
