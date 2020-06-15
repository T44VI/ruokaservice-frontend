import Vue from "vue";
import Vuex, { GetterTree, ActionTree, MutationTree } from "vuex";
import {
  State,
  apiCallOption,
  TMonth,
  DMonth,
  YearPrice,
  Price,
  AuthRole,
  User,
  AllUsers,
  IndUser,
  AllergyProfile,
  DateDay,
  Day,
  KitchenDay,
  AllPayments,
} from "../types";
import _ from "lodash";
import apiCalls from "../apiCalls";

Vue.use(Vuex);

const state: State = {
  apiCall: { month: 0, price: 0, user: 0, kitchen: 0, payments: 0 },
  choosedMonth: {
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  },
  payments: {
    ts: 0,
    payments: [],
  },
  admin: {
    year: 2020,
  },
  months: {},
  prices: {
    y2020: {
      ts: Date.now() - 400000,
      year: 2020,
      prices: [
        {
          id: "abv",
          fod: "lunch",
          special: false,
          name: "Toiska-lounas",
          time: "12:00",
          normal: 6.4,
          young: 2.3,
          child: 2.0,
          start: { year: 2020, month: 5, day: 12 },
          end: { year: 2020, month: 7, day: 12 },
        },
        {
          id: "jeejee",
          fod: "coffee",
          special: false,
          name: "Päiväkahvit",
          time: "15:00",
          normal: 2.0,
          young: 1.3,
          child: 1.0,
          start: { year: 2020, month: 4, day: 28 },
          end: { year: 2020, month: 7, day: 29 },
        },
        {
          id: "juhjuh",
          fod: "lunch",
          special: true,
          name: "Sadonkorjuubrunssi",
          time: "12:30",
          normal: 7.4,
          young: 3.3,
          child: 3.0,
          start: { year: 2020, month: 6, day: 12 },
          end: { year: 2020, month: 6, day: 12 },
        },
      ],
    },
  },
  user: {
    id: "",
    user: "Jyrilät",
    profiles: [
      {
        id: "abc",
        base: "normal",
        name: "Allergiat",
        allergies: ["Maidoton", "Kalaton"],
      },
    ],
    role: "unauthorized",
    password: "", //"Kikionparasjaihanin",
  },
  allUsers: {
    ts: Date.now(),
    users: [],
  },
  allergies: {
    ts: Date.now(),
    allergies: _.uniq([
      "Maidoton",
      "Kalaton",
      "Gluteiiniton",
      "Vegaani",
      "Munaton",
      "Lorem",
      "ipsum",
      "dolor",
      "sit",
      "amet,",
      "consectetur",
      "adipiscing",
      "elit",
      "Suspendisse",
      "mauris",
      "dui,",
      "molestie",
      "non",
      "consequat",
      "vel,",
      "fringilla",
      "vel",
      "est",
      "Duis",
      "lobortis",
      "sem",
      "sit",
      "amet",
      "augue",
      "tempus,",
      "a",
      "pellentesque",
      "dolor",
      "euismod",
      "Aenean",
      "at",
      "auctor",
      "lectus,",
      "id",
      "congue",
      "nibh",
      "Donec",
      "quis",
      "ex",
      "non",
      "sapien",
      "posuere",
      "viverra",
      "Mauris",
      "condimentum",
      "ipsum",
      "elit",
      "Proin",
      "dui",
      "mi",
    ]),
  },
  kitchenDay: undefined,
};
const getters: GetterTree<State, State> = {
  choosedMonthData: (state) =>
    state.months[`m${state.choosedMonth.year}${state.choosedMonth.month}`],
  choosedMonthPriceData: (state) =>
    state.prices[`y${state.choosedMonth.year}`].prices.filter(
      (p) =>
        (p.start.year < state.choosedMonth.year ||
          (p.start.year === state.choosedMonth.year &&
            p.start.month <= state.choosedMonth.month)) &&
        (p.end.year > state.choosedMonth.year ||
          (p.end.year === state.choosedMonth.year &&
            p.end.month >= state.choosedMonth.month))
    ),
  getUserProfiles: (state) => (state.user ? state.user.profiles : []),
  getAllergies: (state) => state.allergies.allergies,
  adminGetYearPrices: (state): Price[] =>
    state.admin && state.prices[`y${state.admin.year}`]
      ? state.prices[`y${state.admin.year}`].prices
      : [],
};

const mutations: MutationTree<State> = {
  startApiCall(state: State, api: apiCallOption) {
    state.apiCall = {
      ...state.apiCall,
      [api]: state.apiCall[api] + 1,
    };
  },
  endApiCall(state: State, api: apiCallOption) {
    state.apiCall = {
      ...state.apiCall,
      [api]: state.apiCall[api] - 1,
    };
  },
  updateMonth(state: State, data: TMonth) {
    const monthName = `m${data.year}${data.month}`;
    state.months = {
      ...state.months,
      [monthName]: data,
    };
  },
  updateKitchenDay(state: State, kd: KitchenDay) {
    state.kitchenDay = kd;
  },
  resetMonths(state: State) {
    state.months = {};
  },
  chooseMonth(state: State, newMonth: DMonth) {
    state.choosedMonth = newMonth;
  },
  updatePrices(state: State, price: YearPrice) {
    state.prices = {
      ...state.prices,
      [`y${price.year}`]: price,
    };
  },
  chooseAdminYear(state: State, newYear: number) {
    state.admin = {
      ...state.admin,
      year: newYear,
    };
  },
  updateAllUsers(state: State, newAllUsers: AllUsers) {
    state.allUsers = newAllUsers;
  },
  updateCurrentUser(state: State, newIndUser: IndUser) {
    state.user = {
      ...state.user,
      profiles: newIndUser.allergyProfiles || [],
      id: newIndUser.id,
      user: newIndUser.name,
    };
  },
  updatePayments(state: State, newAllPayments: AllPayments) {
    state.payments = newAllPayments;
  },
  setPassword(state: State, newPassword: string) {
    state.user = {
      ...state.user,
      password: newPassword,
    };
  },
  setUserRole(state: State, newRole: AuthRole) {
    state.user = {
      ...state.user,
      role: newRole,
    };
  },
};

const actions: ActionTree<State, State> = {
  getNewMonth: async ({ state, commit, dispatch }, { year, month }: DMonth) => {
    commit("startApiCall", "month");
    const setAuth = (newRole: AuthRole) => dispatch("updateUserRole", newRole);
    try {
      commit(
        "updateMonth",
        await apiCalls.regs.getMonthByUser(
          year,
          month,
          state.user.id || "",
          setAuth,
          state.user.password
        )
      );
    } catch (e) {
      console.log(e);
    }
    commit("endApiCall", "month");
  },
  saveDay: async (
    { state, commit, dispatch },
    { theDay, dateDay }: { theDay: Day; dateDay: DateDay }
  ) => {
    commit("startApiCall", "month");
    //api call
    const setAuth = (newRole: AuthRole) => dispatch("updateUserRole", newRole);
    try {
      commit(
        "updateMonth",
        await apiCalls.regs.saveDay(
          theDay,
          dateDay,
          state.user.id || "",
          setAuth,
          state.user.password
        )
      );
    } catch (e) {
      console.log(e);
    }
    commit("endApiCall", "month");
  },
  getNewKitchenDay: async (
    { state, commit, dispatch },
    { year, month, day }: DateDay
  ) => {
    commit("startApiCall", "kitchen");
    const setAuth = (newRole: AuthRole) => dispatch("updateUserRole", newRole);
    try {
      commit(
        "updateKitchenDay",
        await apiCalls.regs.getKitchenDay(
          year,
          month,
          day,
          setAuth,
          state.user.password
        )
      );
    } catch (e) {
      console.log(e);
    }
    commit("endApiCall", "kitchen");
  },
  updateKitchenDay: ({ state, dispatch }, { year, month, day }: DateDay) => {
    const timeTreshold = Date.now() - 300000;
    const price = `y${year}`;
    if (
      !state.kitchenDay ||
      year !== state.kitchenDay.year ||
      month !== state.kitchenDay.month ||
      day !== state.kitchenDay.day ||
      timeTreshold > state.kitchenDay.ts
    ) {
      dispatch("getNewKitchenDay", { year, month, day });
    }
    if (!state.prices[price] || state.prices[price].ts < timeTreshold) {
      dispatch("getNewPrices", year);
    }
  },
  updateAllUsers: async ({ state, dispatch }) => {
    if (Date.now() - 300000 > state.allUsers.ts) {
      dispatch("getUserList");
    }
  },
  getNewPrices: async ({ state, commit, dispatch }, year: number) => {
    commit("startApiCall", "price");
    //api call
    const setAuth = (newRole: AuthRole) => dispatch("updateUserRole", newRole);
    try {
      commit(
        "updatePrices",
        await apiCalls.prices.getByYear(year, setAuth, state.user.password)
      );
    } catch (e) {
      console.log(e);
    }
    commit("endApiCall", "price");
  },
  getUserList: async ({ state, commit, dispatch }) => {
    commit("startApiCall", "user");
    //api call
    const setAuth = (newRole: AuthRole) => dispatch("updateUserRole", newRole);
    try {
      commit(
        "updateAllUsers",
        await apiCalls.users.getAllUsers(setAuth, state.user.password)
      );
    } catch (e) {
      console.log(e);
    }
    commit("endApiCall", "user");
  },
  getPayments: async ({ state, commit, dispatch }, year: number) => {
    commit("startApiCall", "payments");
    //api call
    const setAuth = (newRole: AuthRole) => dispatch("updateUserRole", newRole);
    try {
      commit(
        "updatePayments",
        await apiCalls.payments.getPaymentsByYear(
          year,
          state.user.id || "",
          setAuth,
          state.user.password
        )
      );
    } catch (e) {
      console.log(e);
    }
    commit("endApiCall", "payments");
  },
  savePayment: async (
    { state, commit, dispatch },
    payment: { dateDay: DateDay; amount: number; name: string; id?: string }
  ) => {
    commit("startApiCall", "payments");
    //api call
    const setAuth = (newRole: AuthRole) => dispatch("updateUserRole", newRole);
    try {
      commit(
        "updatePayments",
        await apiCalls.payments.savePayment(
          payment,
          state.user.id || "",
          setAuth,
          state.user.password
        )
      );
    } catch (e) {
      console.log(e);
    }
    commit("endApiCall", "payments");
  },
  setUserProfile: async ({ state, commit, dispatch }, id: string) => {
    commit("startApiCall", "user");
    //api call
    const setAuth = (newRole: AuthRole) => dispatch("updateUserRole", newRole);
    try {
      commit("resetMonths");
      commit(
        "updateCurrentUser",
        await apiCalls.users.getUserById(id, setAuth, state.user.password)
      );
    } catch (e) {
      console.log(e);
    }
    commit("endApiCall", "user");
  },
  addUserName: async ({ state, commit, dispatch }, name: string) => {
    commit("startApiCall", "user");
    //api call
    const setAuth = (newRole: AuthRole) => dispatch("updateUserRole", newRole);
    try {
      commit(
        "updateAllUsers",
        await apiCalls.users.addNewUser(name, setAuth, state.user.password)
      );
    } catch (e) {
      console.log(e);
    }
    commit("endApiCall", "user");
  },
  updateUserRole: ({ state, commit }, newRole: AuthRole) => {
    if (newRole !== state.user.role) {
      commit("setUserRole", newRole);
    }
  },
  editAllergyProfile: async (
    { state, commit, dispatch },
    newProfile: AllergyProfile
  ) => {
    commit("startApiCall", "user");
    //api call
    const setAuth = (newRole: AuthRole) => dispatch("updateUserRole", newRole);
    try {
      commit(
        "updateCurrentUser",
        await apiCalls.users.updateAllergyProfile(
          newProfile,
          state.user.id || "",
          setAuth,
          state.user.password
        )
      );
    } catch (e) {
      console.log(e);
    }
    commit("endApiCall", "user");
  },
  changeMonth({ state, dispatch }, change: number) {
    const month: DMonth = {
      month: (state.choosedMonth.month + change + 12) % 12,
      year:
        state.choosedMonth.year +
        Math.floor((state.choosedMonth.month + change) / 12),
    };
    dispatch("changeMonthTo", month);
  },
  changeMonthTo({ state, commit, dispatch }, month: DMonth) {
    const id = `m${month.year}${month.month}`;
    const price = `y${month.year}`;
    const timeTreshold = Date.now() - 300000;
    if (!state.months[id] || state.months[id].ts < timeTreshold) {
      dispatch("getNewMonth", month);
    }
    if (!state.prices[price] || state.prices[price].ts < timeTreshold) {
      dispatch("getNewPrices", month.year);
    }
    commit("chooseMonth", month);
  },
  changeAdminYear({ state, commit, dispatch }, year: number) {
    const id = `y${year}`;
    const timeTreshold = Date.now() - 300000;
    if (!state.prices[id] || state.prices[id].ts < timeTreshold) {
      dispatch("getNewPrices", year);
    }
    commit("chooseAdminYear", year);
  },
  editPrice: async ({ state, commit, dispatch }, price: Price) => {
    commit("startApiCall", "price");
    //api call
    const setAuth = (newRole: AuthRole) => dispatch("updateUserRole", newRole);
    try {
      commit(
        "updatePrices",
        await apiCalls.prices.addNew(price, setAuth, state.user.password)
      );
    } catch (e) {
      console.log(e);
    }
    commit("endApiCall", "price");
  },
};

export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
});
