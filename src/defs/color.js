function genFilter(id, value) {
  return {
    attr: {
      id: id
    },
    subNodes: [{
      name: 'feColorMatrix',
      attr: {
        type: 'matrix',
        in: 'SourceGraphic',
        values: `${value} 0 0 0 0 `
              + `0 ${value} 0 0 0 `
              + `0 0 ${value} 0 0 `
              + `0 0 0 ${value} 0`
      }
    }]
  }
}

export function darkerFilter(k = 1) {
  return genFilter('darker', 0.7 ** k)
}

export function brighterFilter(k = 1) {
  return genFilter('brighter', (1 / 0.7) ** k)
}
