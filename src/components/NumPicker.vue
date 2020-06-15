<template>
  <div class="numPicker">
    <div
      class="numPicker-button numPicker-dec"
      :class="[value === 0 ? 'disabled' : '']"
      v-on:click="buttonPress(false)"
    >
      <p>-</p>
    </div>
    <div class="numPicker-content">
      <input
        v-model.number="innerState"
        type="number"
        :min="0"
        :max="99"
        @change="contchange()"
      />
    </div>
    <div
      class="numPicker-button numPicker-inc"
      :class="[value === 99 ? 'disabled' : '']"
      v-on:click="buttonPress(true)"
    >
      <p>+</p>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import _ from "lodash";

@Component
export default class NumPicker extends Vue {
  @Prop() readonly value!: number;
  @Prop() readonly onChange!: (newVal: number) => void;
  oldProp: number = this.value;

  buttonPress(plus: boolean) {
    if ((plus && this.value < 99) || (!plus && this.value > 0))
      this.onChange(this.value + (plus ? 1 : -1));
  }

  updated() {
    if (this.value !== this.oldProp) {
      this.innerState = this.value;
      this.oldProp = this.value;
    }
  }

  contchange() {
    if (!this.innerState || this.innerState <= 0) {
      return this.onChange(0);
    }
    if (this.innerState > 99) {
      return this.onChange(99);
    }
    return this.onChange(Math.floor(this.innerState));
  }

  innerState: number = this.value;
}
</script>
<style lang="scss">
.numPicker {
  display: flex;
  border: 2px solid black;
  border-radius: 10px;
  font-size: 1.4rem;
  height: 2rem;
  .numPicker-button {
    display: flex;
    align-items: center;
    user-select: none;
    cursor: pointer;
    p {
      margin: 0;
    }
  }
  .numPicker-dec {
    border-right: 1px solid black;
    padding: 0 0.8rem;
    &.disabled {
      background: rgba(0, 0, 0, 0.2);
      cursor: not-allowed;
      border-radius: 8px 0 0 8px;
    }
  }
  .numPicker-inc {
    border-left: 1px solid black;
    padding: 0 0.5rem;
    &.disabled {
      background: rgba(0, 0, 0, 0.2);
      cursor: not-allowed;
      border-radius: 0 8px 8px 0;
    }
  }
  .numPicker-content {
    display: flex;
    align-items: center;
    input {
      width: 3rem;
      font-size: 1.2rem;
      text-align: center;
      background: transparent;
      box-shadow: none;
      border: none;
    }
  }
}
</style>
