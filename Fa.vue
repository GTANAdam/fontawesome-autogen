<template >
  <font-awesome-icon :icon="getIcon" :border="border" :fixedWidth="fixedWidth" :flip="flip" :mask="mask"
    :listItem="listItem" :pull="pull" :pulse="pulse" :rotation="rotation" :swapOpacity="swapOpacity" :size="size"
    :spin="spin" :transform="transform" :symbol="symbol" :title="title" :inverse="inverse" 
    :style="isDuotone ? {'--fa-primary-color': primaryColor, '--fa-secondary-color': secondaryColor} : {}"/>
</template>

<script>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

export default {
  components : {
    FontAwesomeIcon
  },
  props: {
    // Custom
    icon: {
      type: String,
      required: true,
      // validator: (value) => ... // TODO: Check if contains fa(s|r|d|l|t)
    },
    primaryColor: {
      type: String,
      default: ""
    },
    secondaryColor: {
      type: String,
      default: ""
    },

    // https://github.com/FortAwesome/vue-fontawesome/blob/2.x/src/components/FontAwesomeIcon.js
    border: {
      type: Boolean,
      default: false
    },
    fixedWidth: {
      type: Boolean,
      default: false
    },
    flip: {
      type: String,
      default: null,
      validator: (value) => ['horizontal', 'vertical', 'both'].indexOf(value) > -1
    },
    mask: {
      type: [Object, Array, String],
      default: null
    },
    listItem: {
      type: Boolean,
      default: false
    },
    pull: {
      type: String,
      default: null,
      validator: (value) => ['right', 'left'].indexOf(value) > -1
    },
    pulse: {
      type: Boolean,
      default: false
    },
    rotation: {
      type: [String, Number],
      default: null,
      validator: (value) => [90, 180, 270].indexOf(parseInt(value, 10)) > -1
    },
    swapOpacity: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: null,
      validator: (value) => ['lg', 'xs', 'sm', '1x', '2x', '3x', '4x', '5x', '6x', '7x', '8x', '9x', '10x'].indexOf(value) > -1
    },
    spin: {
      type: Boolean,
      default: false
    },
    transform: {
      type: [String, Object],
      default: null
    },
    symbol: {
      type: [Boolean, String],
      default: false
    },
    title: {
      type: String,
      default: null
    },
    inverse: {
      type: Boolean,
      default: false
    },
  },
  computed: {
    getIcon() {
        const spl = this.icon.split('-');
        const prefix = spl[0];
        const icon = spl.slice(1).join('-');
        return [prefix, icon];
    },
    isDuotone() {
      return this.icon.split('-')[0] === "fad"
    }
  },
};
</script>
