<template>
  <div id="app" :class="[darkTheme ? 'theme--dark' : 'theme--default']">
    <div class="theme">
      <div v-if="user.role === 'unauthorized' || !user.id" class="main-content">
        <Auth />
      </div>
      <div v-else>
        <div class="top-bar">
          <div class="links">
            <router-link to="/cal"
              ><p>{{ names.month }}</p></router-link
            >
            <router-link to="/admin" v-if="user.role === 'admin'"
              ><p>{{ names.admin }}</p></router-link
            >
            <router-link to="/auth"
              ><p>{{ names.auth }}</p></router-link
            >
            <router-link to="/profile"
              ><p>{{ names.profile }}</p></router-link
            >
            <router-link to="/payments"
              ><p>{{ names.payments }}</p></router-link
            >
          </div>
          <div class="name">
            <p>{{ user.user }}</p>
          </div>
          <div
            id="burger"
            :class="{ active: menuOpen }"
            @click.prevent="toggleMenu()"
          >
            <button type="button" class="burger-button" title="Menu">
              <span class="burger-bar burger-bar--1"></span>
              <span class="burger-bar burger-bar--2"></span>
              <span class="burger-bar burger-bar--3"></span>
            </button>
          </div>
          <transition name="fade">
            <div class="sidebar" v-show="menuOpen">
              <div
                class="sidebar-backdrop"
                @click="toggleMenu()"
                v-if="menuOpen"
              ></div>
              <transition name="slide">
                <div v-if="menuOpen" class="sidebar-panel">
                  <div class="main-menu">
                    <router-link to="/cal"
                      ><p @click="toggleMenu()">
                        {{ names.month }}
                      </p></router-link
                    >
                    <router-link to="/admin" v-if="user.role === 'admin'"
                      ><p @click="toggleMenu()">
                        {{ names.admin }}
                      </p></router-link
                    >
                    <router-link to="/auth"
                      ><p @click="toggleMenu()">
                        {{ names.auth }}
                      </p></router-link
                    >
                    <router-link to="/profile"
                      ><p @click="toggleMenu()">
                        {{ names.profile }}
                      </p></router-link
                    >
                    <router-link to="/payments"
                      ><p @click="toggleMenu()">
                        {{ names.payments }}
                      </p></router-link
                    >
                    <button @click="toggleDarkTheme()">
                      {{ darkTheme ? "Vaalea teema" : "Tumma teema" }}
                    </button>

                    <p class="vinfo">{{ buildNum }}</p>
                  </div>
                </div>
              </transition>
            </div>
          </transition>
        </div>

        <!--<HelloWorld msg="Welcome to Your Vue.js + TypeScript App" />-->
        <router-view class="main-content"></router-view>
      </div>
      <p class="bottom-vinfo">{{ buildNum }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
//import HelloWorld from "./components/HelloWorld.vue";
import Day from "./components/Day.vue";
import Month from "./components/Month.vue";
import "normalize.css";
import { mapState, mapMutations } from "vuex";
import { UserData } from "./types";
import Auth from "./components/Auth.vue";

@Component({
  computed: {
    ...mapState({ user: "user" }),
  },
  components: {
    Auth,
  },
})
export default class App extends Vue {
  user!: UserData;

  menuOpen = false;
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  darkTheme = false;
  toggleDarkTheme() {
    this.darkTheme = !this.darkTheme;
  }

  names = {
    month: "Kuukausi",
    admin: "Admin",
    profile: "Profiili",
    payments: "Maksut",
    auth: "Vaihda profiilia",
  };

  buildNum = "Devbuild-2021-06-21-1";
}
</script>

<style lang="scss">
@import "./themes.scss";

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}

.theme {
  min-height: 100vh;
  min-width: 100vw;
  transition: color 0.5s, background-color 0.5s;
  @include themed() {
    color: t($text);
    background-color: t($bg);
  }
}

a {
  text-decoration: none;
}
button {
  background: none;
  border: 2px solid black;
  border-radius: 1rem;
  padding: 0.4rem 1.2rem;
  margin: 0.4rem;
  height: 2.6rem;
  cursor: pointer;
  transition: border-color, color 0.5s;
  @include themed() {
    border-color: t($lines);
    color: t($text);
    &.colored {
      background: t($primary);
    }
  }
}

.bottom-vinfo {
  display: none;
  @media (min-width: 600px) {
    display: block;
  }
}

.main-content {
  padding: 0.5rem;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  animation: gradient 16s linear infinite;
  animation-direction: alternate;

  @include themed() {
    background: linear-gradient(
      45deg,
      t($primary),
      t($secondary),
      t($thirdiary)
    );
    background-size: 600% 100%;
  }

  .sidebar {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    .sidebar-backdrop {
      background-color: rgba(0, 0, 0, 0.5);
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      cursor: pointer;
    }
    .sidebar-panel {
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      width: 60vw;
      align-items: center;
      justify-content: space-between;
      animation: gradient 16s linear infinite;
      animation-direction: alternate;

      transition: background 0.5s;
      @include themed() {
        background: linear-gradient(
          45deg,
          t($primary),
          t($secondary),
          t($thirdiary)
        );
        background-size: 600% 100%;
      }

      .main-menu {
        padding-top: 2rem;

        transition: color 0.5s;
        @include themed() {
          color: t($oppositetext);
        }
        a {
          display: block;
          font-size: 1.2rem;

          transition: color 0.5s;
          @include themed() {
            color: t($oppositetext);
          }
          p {
            padding: 1rem;
            margin: 0;
          }
        }
        .vinfo {
          bottom: 0;
          position: absolute;
          width: 100%;
        }
      }
    }
  }

  .burger-button {
    position: relative;
    height: 30px;
    width: 32px;
    display: block;
    border: 0;
    border-radius: 0;
    background-color: transparent;
    height: 2.6rem;
    pointer-events: all;
    transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
  }

  .links {
    display: none;
  }

  .name {
    flex-grow: 1;
    font-size: 1.1rem;
    padding: 0 0.8rem;
    p {
      position: absolute;
      top: 0;
      left: 4rem;
      right: 4rem;
      float: center;
    }

    @include themed() {
      color: t($oppositetext);
    }
  }

  .burger-bar {
    position: absolute;
    top: 50%;
    right: 6px;
    left: 6px;
    height: 2px;
    width: auto;
    margin-top: -1px;

    @include themed() {
      background-color: t($oppositetext);
    }
    transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1),
      opacity 0.3s cubic-bezier(0.165, 0.84, 0.44, 1),
      background-color 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
  }

  .burger-bar--1 {
    -webkit-transform: translateY(-6px);
    transform: translateY(-6px);
  }

  .burger-bar--2 {
    transform-origin: 100% 50%;
    transform: scaleX(0.8);
  }

  .burger-button:hover .burger-bar--2 {
    transform: scaleX(1);
  }

  .no-touchevents .burger-bar--2:hover {
    transform: scaleX(1);
  }

  .burger-bar--3 {
    transform: translateY(6px);
  }

  #burger.active .burger-button {
    transform: rotate(-180deg);
  }

  #burger.active .burger-bar {
    @include themed() {
      background-color: t($oppositetext);
    }
  }

  #burger.active .burger-bar--1 {
    transform: rotate(45deg);
  }

  #burger.active .burger-bar--2 {
    opacity: 0;
  }

  #burger.active .burger-bar--3 {
    transform: rotate(-45deg);
  }

  .slide-enter-active,
  .slide-leave-active {
    transition: transform 0.2s ease;
  }

  .slide-enter,
  .slide-leave-to {
    transform: translateX(-100%);
    transition: all 150ms ease-in 0s;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s;
  }

  @media (min-width: 600px) {
    #burger {
      display: none;
    }
    .links {
      display: flex;
      a {
        height: 2.6rem;
        padding: 0 0.4rem;
        border-right: 1px solid black;
        display: flex;
        align-items: center;

        background: transparent;
        @include themed() {
          &:hover {
            background: linear-gradient(
              0deg,
              rgba(t($text), 0) 0%,
              rgba(t($text), 0.3) 50%,
              rgba(t($text), 0) 100%
            );
          }
          color: t($oppositetext);
          border-color: t($oppositetext);
        }
        p {
          margin: 0;
        }
      }
    }
    .name {
      flex-grow: 0;
      p {
        position: static;
      }
    }
  }
}

@keyframes gradient {
  0% {
    background-position: 0%;
  }
  100% {
    background-position: 100%;
  }
}
</style>
