<template>
  <div v-show='show'
    class='loading-container'>
    <div v-show='loading' class='content'
      :style='{width: width + "px", height: height + "px"}'>
      <div class='rect1' :style='rectStyle'></div>
      <div class='rect2' :style='rectStyle'></div>
      <div class='rect3' :style='rectStyle'></div>
      <div class='rect4' :style='rectStyle'></div>
      <div class='rect5' :style='rectStyle'></div>
    </div>
    <div v-show='showMsg' class='content'>
      <p>{{message}}</p>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      loading: {
        type: Boolean,
        default: false,
      },
      message: {
        type: String,
        default: '',
      },
    },
    data() {
      return {
        width: 60,
        height: 60,
      }
    },
    computed: {
      rectStyle() {
        return {
          width: this.width / 12 + 'px',
          margin: '0px ' + this.width / 24 + 'px',
        }
      },
      showMsg() {
        return this.message !== '' && !this.loading
      },
      show() {
        return this.loading || this.showMsg
      }
    },
    methods: {
    }
  }
</script>

<style lang='less' scoped>
  @loadingTimeout: 2s;
  @loadingInterval: 0.2;

  .loading-container {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }

  .content {
    font-size: 0px; //对inline-block存在间隙的hack

    > p {
      font-size: 13px;
    }

    > div {
      background-color: #67CF22;
      height: 100%;
      display: inline-block;
      animation: load-stretch-delay @loadingTimeout infinite ease-in-out;
    }

    .rect2 {
      animation-delay: @loadingInterval - @loadingTimeout;
    }

    .rect3 {
      animation-delay: @loadingInterval * 2- @loadingTimeout;
    }

    .rect4 {
      animation-delay: @loadingInterval * 3 - @loadingTimeout;
    }

    .rect5 {
      animation-delay: @loadingInterval * 4 - @loadingTimeout;
    }
  }

  @keyframes load-stretch-delay {
    0%,
    40%,
    100% {
      transform: scaleY(0.4);
    }
    20% {
      transform: scaleY(1.0);
    }
  }
</style>
