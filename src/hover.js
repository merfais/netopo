import {
  bind,
  bindStyle,
  merge,
  setNull,
} from './util'
import tooltip from './tooltip'
import eventer from './event'

function rollbackProp(hover, normal) {
  return merge(setNull(hover), normal)
}

const subscribers = {
  node($parent) {
    return {
      mouseenter(d) {
        let id = `#${d.id}_shape`
        let attr = 'shape'
        if (d.shape.type === 'text') {
          id = 'div'
          attr = 'label'
        }
        $parent.select(id).call(bind(d[attr].hover))
        tooltip.show(d)
        eventer.emit('node.hover', d)
      },
      mouseleave(d) {
        let id = `#${d.id}_shape`
        let attr = 'shape'
        if (d.shape.type === 'text') {
          id = 'div'
          attr = 'label'
        }
        const prop = rollbackProp(d[attr].hover, {
          style: d[attr].style,
          class: d[attr].class,
        })
        const $shape = $parent.select(id)
        $shape.call(bind(prop))
        if (d.shape.type === 'image') {
          $shape.attr('href', d.shape.href)
        }
        tooltip.hide()
      },
      mousemove(d) {
        tooltip.update()
      },
    }
  },
  edge($parent) {
    return {
      mouseenter(d) {
        $parent.select(`#${d.id}`).call(bind(d.path.hover))
        tooltip.show(d)
        eventer.emit('edge.hover', d)
      },
      mouseleave(d) {
        const prop = rollbackProp(d.path.hover, {
          style: d.path.style,
          class: d.path.class,
        })
        $parent
          .select(`#${d.id}`)
          .call(bind(prop))
        tooltip.hide()
      },
      mousemove(d) {
        tooltip.update()
      },
    }
  },
  thumbnails($thumbnails) {
    return {
      mouseenter(d) {
        $thumbnails.call(bindStyle(d.hover))
        eventer.emit('thumbnails.hover', d)
      },
      mouseleave(d) {
        $thumbnails.call(bindStyle({
          height: d.style.height,
          width: d.style.width,
        }))
      },
    }
  },
  default() {
    return {
      mouseenter() {},
      mousemove() {},
      mouseleave() {},
    }
  }
}

export function unBindHover(type) {
  const subscriber = type ? subscribers[type] : subscribers.default
  if (subscriber) {
    return eventer.unBind(subscriber())
  }
}

export function bindHover(type, ...args) {
  const subscriber = subscribers[type]
  if (!subscriber) {
    throw new Error('event subscriber not defined')
  }
  return eventer.bind(subscriber(...args))
}
