<template>
  <button
    class='btn'
    :class='buttonClass'
    :style='buttonStyle'
    :title='title'
    type='button'
    @click='click'
    >
    <span>
      <slot></slot>
    </span>
    <span class='caret' v-if='withCaret'></span>
  </button>
</template>

<script>
  export default {
    props: {
      type: {
        type: String,
        default: 'default'
      },
      width: {
        type: String,
        default: ''
      },
      height: {
        type: String,
        default: ''
      },
      active: {
        type: Boolean,
        default: false,
      },
      withCaret: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
      }
    },
    computed: {
      buttonStyle() {
        let style = {}
        if (this.width !== '') {
          style.width = this.width
        }
        if (this.height !== '') {
          style.height = this.height
        }
        return style
      },
      buttonClass() {
        const activeClass = this.active ? 'btn-active' : ''
        return `${this.type} ${activeClass}`
      },
      title() {
        return this.type === 'label' && this.$slots.default ?
          this.$slots.default[0] && this.$slots.default[0].text : ''
      }
    },
    methods: {
      click(e) {
        this.$emit('click', e)
      }
    },
    mounted() {
    }
  }
</script>

<style scoped>

  .btn {
    cursor: pointer;
    padding: 10px 15px;
    margin: 0;
    text-align: center;
    line-height: 1;
    font-size: 14px;
    white-space: nowrap;
    color: #606266;
    background-color: #fff;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    transition: all ease-in-out .2s;

    &:hover {
      background-color: #fff;
      color: #409eff;
      border-color: #409eff;
    }

    &:focus {
      background-color: #fff;
      color: #409eff;
      border-color: #409eff;
    }

    &:active,
    &.btn-active {
      background-color: #fff;
      color: #3a8ee6;
      border-color: #3a8ee6;
    }
  }

  .default {
    min-width: 100px;
  }

</style>
