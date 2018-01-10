const options = {
  grid: {
    top: '0px',       // margin.top
    right: '0px',     // margin.right
    left: '0px',      // margin.left
    bottom: '0px',    // margin.bottom
    width: '100%',
    height: '100%',
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
  shadow: {
    // normal, hover
  },
  tooltip: {
    // style
  },
  zoom: {
    thumbnails: {
      // style
    },
  },
  resize: {
    enable: true,
    action: {
      redraw: false,      // false =》zoom
      zoomBase: 'width',  // 当zoom以width还是以height为缩放基准
    },
  },
}

export default options
