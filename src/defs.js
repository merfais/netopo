import _ from 'lodash'
import {
  darkerFilter,
  brighterFilter,
} from './helper'

export function renderFilters($defs, filter, options) {
  _.forEach(options.custom, (item, key) => {
    if (!_.has(item, 'attr')) {
      item.attr = {}
    }
    if (!_.has(item.attr, 'id')) {
      item.attr.id = key
    }
    filter.use(item)
  })
  filter.use(darkerFilter(options.darker.value))
  filter.use(brighterFilter(options.brighter.value))
  if (filter.data.length) {
    const $filters = $defs.selectAll('filter').data(filter.data, d => d.attr.id)
    $filters.exit().remove()
    $filters.enter().append(d => filter.render(d))
  }
}
