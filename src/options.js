const options = {
  grid: {
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
  },
  node: {
    drag: {},
    shape: {},
    label: {},
    shadow: {},
  },
  edge: {
    path: {},
    shadow: {},
  },
  // 开启filter式的shadow有性能问题
  shadow: {
    style: {
      offsetX: 2,
      offsetY: 2,
      blur: 3,
      color: 'rgba(0,0,0,.3)',
    },
    hover: {
      offsetX: 2,
      offsetY: 2,
      blur: 3,
      color: 'rgba(0,0,0,.5)',
    },
  },
  tooltip: {
    // style
  },
  thumbnails: {
    // style
  }
}

export default options

/*
export const options = {
  node: {
    group: '',
    shape: {
      type: 'text', // rect | circle | image
      rect: {
        style: {
          width: '100px',
          height: '50px',
          stroke
        }
      },
      circle: {

      },
      image: {

      },
    },
    label: {
      style: {

      },
      class: '',
      anchor: 'middle',
      offset: {
        x: 0,
        y: 0,
      }
    },
    position: {
      x: 0,
      y: 0,
    }
    physics: {

    },
  },
  link: {

  }
}

// 数据源
const data = {
  nodes: [],
  links: [],
}

// 数据源/单条
const node = {
  id: '',
  value: '',  // 需要额外的映射
  size: ''    // 控制节点大小
  color: '',  // 控制颜色
  position: { // 映射transform
    x: '',
    y: '',
  },
  shape: {
    type: 'rect',
    x: 0,
    y: 0,
    rx: 5,
    ry: 5,
    width: 100,
    height: 30,
    style: {},
    class: '',
  },
  label: {
    text: '',
    x: 0,
    y: 0,
    width: 100,
    height: 30,
    style: {}
  }
}

const link = {
  shape: {

  },
  label: {

  }
}
*/
