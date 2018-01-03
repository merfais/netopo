import {
  bind,
  bindStyle,
  merge,
  setNull,
} from './util'
import ds from './dataSet'
import tooltip from './tooltip'
import eventer from './event'

const dftTooltipFormatter = {
  node(d) {
    return `${d.label.text}: ${d.value}`
  },
  edge(d) {
    let source = ds.nodeMap.get(d.source)
    source = source ? source.label.text : d.source
    let target = ds.nodeMap.get(d.target)
    target = target ? target.label.text : d.target
    return `${source} -> ${target}: ${d.value}`
  }
}

function rollbackProp(hover, normal) {
  return merge(setNull(hover), normal)
}

const subscribers = {
  node($parent) {
    return {
      mouseenter(d) {
        $parent
          .select(`#${d.id}_shape`)
          .call(bind(d.shape.hover))
        if (d.tooltip.enable) {
          let formatter = dftTooltipFormatter.node
          if (_.isFunction(d.tooltip.formatter)) {
            formatter = d.tooltip.formatter
          }
          tooltip.show(formatter(d))
        }
        eventer.emit('node.hover', d)
      },
      mouseleave(d) {
        const prop = rollbackProp(d.shape.hover, {
          style: d.shape.style,
          class: d.shape.class,
        })
        const $shape = $parent
          .select(`#${d.id}_shape`)
          .call(bind(prop))
        if (d.shape.type === 'image') {
          $shape.attr('href', d.shape.href)
        }
        tooltip.hide()
      },
      mousemove(d) {
        if (d.tooltip.enable) {
          tooltip.update()
        }
      },
    }
  },
  edge($parent) {
    return {
      mouseenter(d) {
        $parent
          .select(`#${d.id}`)
          .call(bind(d.path.hover))
        if (d.tooltip.enable) {
          let formatter = dftTooltipFormatter.edge
          if (_.isFunction(d.tooltip.formatter)) {
            formatter = d.tooltip.formatter
          }
          tooltip.show(formatter(d))
        }
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
        if (d.tooltip.enable) {
          tooltip.update()
        }
      },
    }
  },
  label($parent) {
    return {
      mouseenter(d) {
        $parent
          .select('div')
          .call(bind(d.label.hover))
        if (d.tooltip.enable) {
          let formatter = dftTooltipFormatter.node
          if (_.isFunction(d.tooltip.formatter)) {
            formatter = d.tooltip.formatter
          }
          tooltip.show(formatter(d))
        }
        eventer.emit('label.hover', d)
      },
      mouseleave(d) {
        const prop = rollbackProp(d.label.hover, {
          style: d.label.style,
          class: d.label.class,
        })
        $parent
          .select('div')
          .call(bind(prop))
        tooltip.hide()
      },
      mousemove(d) {
        if (d.tooltip.enable) {
          tooltip.update()
        }
      },
    }
  },
  thumbnails($parent, enable) {
    return {
      mouseenter(d) {
        $parent.select('.thumbnails')
          .transition()
          .call(bindStyle(d.hover))
        eventer.emit('thumbnails.hover', d)
      },
      mouseleave(d) {
        $parent.select('.thumbnails')
          .transition()
          .call(bindStyle({
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
