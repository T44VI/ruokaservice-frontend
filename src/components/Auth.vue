<template>
  <div class="auth">
    <p>Autentikaatio</p>
    <div v-if="isLoading"><Loading /></div>
    <div v-else class="auth-content">
      <p v-if="!!errormessage">{{ errormessage }}</p>
      <input v-model="password" type="password" />
      <div @click="rememberMe = !rememberMe">
        {{ rememberMe ? "✅ Muista minut" : "❌ Muista minut" }}
      </div>
      <button class="colored" @click="confirmPassword()">Kirjaudu</button>
      <div v-if="user.role !== 'unauthorized'">
        <div><p>Valitse käyttäjä</p></div>
        <div class="auth-user-list">
          <div
            v-for="u in allUsers.users"
            :key="u.id"
            :class="[u.id === userId ? 'choosed' : '']"
            @click="setUser(u.id)"
            class="auth-user-item"
          >
            <p>{{ u.name }}</p>
          </div>
          <div @click="openUserAdder()" class="auth-user-add">Lisää uusi</div>
        </div>
        <button v-if="!!userId" class="colored" @click="testUserId()">
          Valitse
        </button>
      </div>
    </div>
    <LocalWindow
      :isOpen="isUserAdderOpen"
      :close="closeUserAdder"
      :header="'Lisää käyttäjä'"
    >
      <input v-model="newUserName" />
      <button @click="saveNewUserName()">Tallenna</button>
    </LocalWindow>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import _ from "lodash";
import { mapState, mapMutations, mapActions } from "vuex";
import { UserData, User, AllUsers, ApiCallStatus } from "../types";
import LocalWindow from "./LocalWindow.vue";
import Loading from "./Loading.vue";

@Component({
  computed: {
    ...mapState({
      user: "user",
      allUsers: "allUsers",
      apiCall: "apiCall",
    }),
  },
  methods: {
    ...mapMutations({
      setPassword: "setPassword",
      setAllUsers: "updateAllUsers",
    }),
    ...mapActions({
      testPassword: "getUserList",
      chooseUser: "setUserProfile",
      addNewUser: "addUserName",
    }),
  },
  components: {
    LocalWindow,
    Loading,
  },
})
export default class Auth extends Vue {
  user!: UserData;
  allUsers!: AllUsers;
  apiCall!: ApiCallStatus;
  setPassword!: (password: string) => void;
  setAllUsers!: (allUsers: AllUsers) => void;
  testPassword!: () => Promise<void>;
  chooseUser!: (id: string) => Promise<void>;
  addNewUser!: (name: string) => Promise<void>;

  isUserAdderOpen = false;
  openUserAdder() {
    this.isUserAdderOpen = true;
  }
  closeUserAdder() {
    this.isUserAdderOpen = false;
  }

  newUserName = "";
  saveNewUserName() {
    this.addNewUser(this.newUserName);
    this.newUserName = "";
    this.closeUserAdder();
  }

  rememberMe = false;

  password = "";
  userId = "";
  errormessage = "";

  get isLoading() {
    return this.apiCall.user > 0;
  }

  mounted() {
    const key = localStorage.getItem("apikey");
    if (key) {
      this.password = key;
      this.confirmPassword();
    }
    if (this.user.id) {
      this.userId = this.user.id;
    }
  }

  setUser(id: string) {
    this.userId = id;
  }

  async testUserId() {
    if (this.rememberMe) {
      localStorage.setItem("user", this.userId);
    }
    await this.chooseUser(this.userId);
    if (this.user.id !== this.userId) {
      this.errormessage = "Jotain meni vikaan";
    } else {
      this.errormessage = "";
    }
  }

  async confirmPassword() {
    if (this.rememberMe) {
      localStorage.setItem("apikey", this.password);
    }
    this.setPassword(this.password);
    this.password = "";
    this.setAllUsers({
      ts: Date.now(),
      users: [],
    });
    await this.testPassword();
    if (this.user.role === "unauthorized") {
      return (this.errormessage = "Salasana väärin");
    }
    this.errormessage = "";
    const id = localStorage.getItem("user");
    if (id) {
      this.userId = id;
      this.testUserId();
    }
  }
}
</script>
<style lang="scss">
@import "../themes.scss";

.auth {
  .auth-content {
    .auth-user-list {
      border: 2px solid black;
      border-radius: 10px;
      overflow: hidden;
      @include themed() {
        border-color: t($lines);
      }
      .auth-user-item {
        border-bottom: 1px solid black;
        user-select: none;
        cursor: pointer;
        padding: 0.6rem;
        @include themed() {
          border-color: t($lines);

          &.choosed {
            background: t($primary);
          }
        }
        p {
          margin: 0;
          font-size: 1rem;
        }
      }
    }
  }
  input {
    @include themed() {
      background: transparent;
      color: t($text);
    }
  }
}
</style>
