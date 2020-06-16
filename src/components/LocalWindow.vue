<template>
  <transition name="fade">
    <div v-if="isOpen" class="local-window background" @click="close">
      <div class="content" @click.stop @scroll.stop.prevent>
        <div class="header">
          <p>{{ header }}</p>
          <button @click="close()">Sulje</button>
        </div>
        <div class="real-content">
          <slot></slot>
        </div>
      </div>
    </div>
  </transition>
</template>
<script lang="ts">
import "reflect-metadata";
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class LocalWindow extends Vue {
  @Prop() readonly isOpen!: boolean;
  @Prop() readonly close!: () => void;
  @Prop() readonly header!: string;
}
</script>
<style lang="scss">
@import "../themes.scss";

.local-window {
  opacity: 1;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  &.background {
    position: fixed;
    padding: 1rem;
    @include themed() {
      background: rgba(t($text), 0.3);
    }
  }
  .content {
    padding: 0.8rem;
    border-radius: 1rem;
    overflow: hidden;
    @include themed() {
      background: t($bg);
    }
    .header {
      display: flex;
      align-items: center;
      p {
        flex-grow: 1;
      }
      border-bottom: 2px solid black;
      @include themed() {
        border-color: t($lines);
      }
    }
    .real-content {
      overflow: scroll;
      max-height: 85vh;
      padding: 0.2rem 0;
    }
  }
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-out;
}
.fade-enter, .fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
