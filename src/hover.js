import {
  select
} from 'd3-selection'
import {
  bind,
  bindStyle
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

const subscriber = {
  node: {
    mouseenter($selector, d) {
      select(`#${d.id}_shape`)
        .call(bind(d.shape.hover))
      if (d.tooltip.enable) {
        let formatter = dftTooltipFormatter.node
        if (_.isFunction(d.tooltip.formatter)) {
          formatter = d.tooltip.formatter
        }
        tooltip.show(formatter(d))
      }
      eventer.emit('hover', $selector, d)
    },
    mouseleave($selector, d) {
      select(`#${d.id}_shape`)
        .call(bindStyle(d.shape.style))
        .attr('class', d.shape.class)
      tooltip.hide()
    },
    mousemove($selector, d) {
      if (d.tooltip.enable) {
        tooltip.update()
      }
    },
  },
  edge: {
    mouseenter($selector, d) {
      select(`#${d.id}`)
        .call(bind(d.path.hover))
      if (d.tooltip.enable) {
        let formatter = dftTooltipFormatter.edge
        if (_.isFunction(d.tooltip.formatter)) {
          formatter = d.tooltip.formatter
        }
        tooltip.show(formatter(d))
      }
    },
    mouseleave($selector, d) {
      select(`#${d.id}`)
        .call(bindStyle(d.path.style))
        .attr('class', d.path.class)
      tooltip.hide()
    },
    mousemove($selector, d) {
      if (d.tooltip.enable) {
        tooltip.update()
      }
    },
  },
  shape: {

  },
  label: {

  },
}

export default function bindHover(type) {
  return eventer.bind(subscriber[type])
}
