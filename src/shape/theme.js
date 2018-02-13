const normal = {
  color: '#333',
  bgColor: '#e8e8e8',
  bdColor: '#666',
  pathColor: '#337ab7',
}

const hover = {
  color: '#3492ff',
  bgColor: '#eee',
  bdColor: '#777',
  pathColor: '#5bc0de',
}

export const rectTheme = {
  shape: {
    style: {
      cursor: 'pointer',
      stroke: normal.bdColor,
      'stroke-width': 0.8,
      fill: normal.bgColor,
    },
    class: '',
    hover: {
      style: {
        stroke: hover.bdColor,
        fill: hover.bgColor,
      },
      class: '',
    }
  },
  label: {
    style: {
      display: 'flex',
      height: '100%',
      padding: '5px',
      color: normal.color,
      'justify-content': 'center',
      'align-items': 'center',
      'word-break': 'break-all',
      'line-height': '1.2em',
      'font-size': '13px',
      'box-sizing': 'border-box',
    },
    class: '',
    // TODO: hover: not support
  },
}

export const circleTheme = {
  shape: {
    style: {
      cursor: 'pointer',
      stroke: normal.bdColor,
      'stroke-width': 0.8,
      fill: normal.bgColor,
    },
    class: '',
    hover: {
      style: {
        stroke: hover.bdColor,
        fill: hover.bgColor,
      },
      class: '',
    },
  },
  label: {
    style: {
      display: 'flex',
      color: normal.color,
      'justify-content': 'center',
      'word-break': 'break-all',
      'line-height': '1.2em',
      'padding-top': '5px',
      'font-size': '13px',
      'box-sizing': 'border-box',
    },
    class: '',
    // TODO: hover: not support
  }
}

export const imageTheme = {
  shape: {
    style: {
      cursor: 'pointer',
      fill: normal.bgColor,
    },
    class: '',
    hover: {
      style: {
        filter: 'url(#brighter)'
      },
      class: '',
    },
  },
  label: {
    style: {
      display: 'flex',
      color: normal.color,
      'justify-content': 'center',
      'word-break': 'break-all',
      'line-height': '1.2em',
      'padding-top': '5px',
      'font-size': '13px',
      'box-sizing': 'border-box',
    },
    class: '',
    // TODO: hover: not support
  },
}

export const textTheme = {
  shape: {  // 用于hover占位的虚拟框，以及发生拖拽时绘制被拖拽的虚拟图形
    style: {
      cursor: 'pointer',
      fill: normal.bgColor,
    },
  },
  label: {
    style: {
      display: 'flex',
      height: '100%',
      color: normal.color,
      'justify-content': 'center',
      'align-items': 'center',
      'word-break': 'break-all',
      'line-height': '1.2em',
      'font-size': '13px',
      'box-sizing': 'border-box',
    },
    class: '',
    hover: {
      style: {
        color: hover.color,
      },
      class: '',
    },
  }
}

export const pathTheme = {
  style: {
    stroke: normal.pathColor,
    'stroke-width': 2,
    cursor: 'pointer',
    fill: 'none',
  },
  class: '',
  hover: {
    style: {
      stroke: hover.pathColor,
      'stroke-width': 3,
      fill: 'none',
    },
    class: '',
  }
}
