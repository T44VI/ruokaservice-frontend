import Vue from "vue";
import VueRouter from "vue-router";
import App from "./App.vue";
import "./registerServiceWorker";
import store from "./store";
import Month from "./components/Month.vue";
import Day from "./components/Day.vue";
import AdminPrices from "./components/AdminPrices.vue";
import Auth from "./components/Auth.vue";
import Profile from "./components/Profile.vue";
import Kitchen from "./components/Kitchen.vue";
import Payments from "./components/Payments.vue";

Vue.use(VueRouter);

Vue.config.productionTip = false;

const router = new VueRouter({
  routes: [
    { path: "/cal", component: Month },
    { path: "/day/:day", name: "day", component: Day },
    { path: "/admin", component: AdminPrices },
    { path: "/auth", component: Auth },
    { path: "/profile", component: Profile },
    { path: "/kitchen/:day", name: "kitchen", component: Kitchen },
    { path: "/payments", component: Payments },
  ],
});

new Vue({
  store,
  router,
  render: (h) => h(App),
}).$mount("#app");
