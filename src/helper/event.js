export default class Eventer {

  _eventMap = new Map()

  // 外部注册事件
  on(name, handler) {
    if (this._eventMap.has(name)) {
      this._eventMap.get(name).push(handler)
    } else {
      this._eventMap.set(name, [handler])
    }
  }
  // 外部释放事件
  off(name, handler) {
    const handlers = this._eventMap.get(name)
    if (handlers) {
      let i = 0
      while (i < handlers.length) {
        if (handler === handlers[i]) {
          handlers.slice(i, 1)
          break;
        }
        i += 1
      }
    }
  }
  // 对外派发事件，触发外部 on 注册的事件回调
  emit(name, ...paramters) {
    _.forEach(this._eventMap.get(name), handler => {
      handler(...paramters)
    })
  }
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
  }
  // 对内部 $selector 解绑事件
  unBind(handlers) {
    return $selector => {
      _.forEach(handlers, (handler, name) => {
        $selector.on(name, null)
      })
    }
  }

  destroy() {
    this._eventMap.clear()
  }
}
