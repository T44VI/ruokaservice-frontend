<template>
  <div id="app">
    <div v-if="user.role === 'unauthorized' || !user.id"><Auth /></div>
    <div v-else>
      <div class="main-menu">
        <router-link to="/cal">Month</router-link>
        <router-link to="/admin" v-if="user.role === 'admin'"
          >Admin</router-link
        >
        <router-link to="/auth">Auth</router-link>
        <router-link to="/profile">Profile</router-link>
        <router-link to="/payments">Payments</router-link>
      </div>
      <!--<HelloWorld msg="Welcome to Your Vue.js + TypeScript App" />-->
      <router-view></router-view>
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
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  padding: 0.5rem;
  margin-top: 60px;
}

a {
  color: #2c3e50;
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
  &.colored {
    background: lightcoral;
  }
}
</style>
