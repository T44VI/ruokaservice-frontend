<template>
  <div class="tabChooser">
    <div
      class="tabChooser-tab"
      :class="[
        i === 0 ? 'left' : '',
        i + 1 === keys.length ? 'right' : '',
        choosedValue === i ? 'choosed' : '',
      ]"
      v-for="(key, i) in keys"
      :key="i"
      v-on:click="chooseVal(i)"
    >
      <p>{{ key }}</p>
    </div>
  </div>
</template>
<script lang="ts">
import "reflect-metadata";
import { Vue, Component, Prop } from "vue-property-decorator";
import _ from "lodash";

@Component
export default class MiniTabChooser extends Vue {
  @Prop() readonly keys!: string[];
  @Prop() readonly onChange!: (newVal: number) => void;
  @Prop({ default: 0 }) readonly choosedValue!: number;
  chooseVal(i: number) {
    if (this.choosedValue !== i) {
      this.onChange(i);
    }
  }
}
</script>
<style lang="scss">
.tabChooser {
  display: flex;
}
.tabChooser-tab {
  flex: 1;
  height: 2rem;
  border: solid black;
  border-width: 2px 1px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  cursor: pointer;
  &.left {
    border-left-width: 2px;
    border-radius: 10px 0 0 10px;
  }
  &.right {
    border-right-width: 2px;
    border-radius: 0 10px 10px 0;
  }
  &.choosed {
    box-shadow: inset 0 0 7px 3px gray;
    background: lightgray;
    cursor: default;
  }
  &:active {
    background: lightgray;
  }
  p {
    margin: 0;
  }
}
</style>
