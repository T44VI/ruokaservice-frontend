<template>
  <div class="kitchen-elem">
    <div v-if="!!isLoading"><Loading /></div>
    <div v-else>
      <MiniTabChooser
        :keys="['Kompakti', 'Yksityiskohtainen']"
        :onChange="onChange"
        :choosedValue="choosedValue"
      />
      <div v-if="choosedValue === 0">
        <div
          v-for="lp in groupedPrices"
          :key="lp.fod"
          class="kitchen-food"
          :class="[lp.special ? 'special-food' : '']"
        >
          <div :class="['kitchen-food-row', 'kitchen-food-header']">
            <div class="header">
              <p>{{ lp.name }}</p>
            </div>
            <div class="table-item"><p>Aikuiset</p></div>
            <div class="table-item"><p>Nuoret</p></div>
            <div class="table-item"><p>Lapset</p></div>
          </div>
          <div class="kitchen-food-row">
            <div class="header">
              <p>{{ lp.normalRows.name }}</p>
            </div>
            <div class="table-item">
              <p>{{ lp.normalRows.counts.normal }}</p>
            </div>
            <div class="table-item">
              <p>{{ lp.normalRows.counts.young }}</p>
            </div>
            <div class="table-item">
              <p>{{ lp.normalRows.counts.child }}</p>
            </div>
          </div>
          <div
            class="kitchen-food-row"
            v-for="srow in lp.specialRows"
            :key="srow.name"
          >
            <div class="header">
              <p v-for="(a, i) in srow.name.split(', ')" :key="a">
                {{ i === srow.name.split(", ").length - 1 ? a : `${a},` }}
              </p>
            </div>
            <div class="table-item">
              <p>{{ srow.counts.normal }}</p>
            </div>
            <div class="table-item">
              <p>{{ srow.counts.young }}</p>
            </div>
            <div class="table-item">
              <p>{{ srow.counts.child }}</p>
            </div>
          </div>
          <div :class="['kitchen-food-row', 'kitchen-food-totals']">
            <div class="header">
              <p>Yhteensä</p>
            </div>
            <div class="table-item">
              <p>{{ lp.totals.normal }}</p>
            </div>
            <div class="table-item">
              <p>{{ lp.totals.young }}</p>
            </div>
            <div class="table-item">
              <p>{{ lp.totals.child }}</p>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <div
          v-for="dp in detailedPrices"
          :key="dp.name"
          class="kitchen-food"
          :class="[dp.special ? 'special-food' : '']"
        >
          <div :class="['kitchen-food-row', 'kitchen-food-header']">
            <div class="header">
              <p>{{ dp.name }}</p>
            </div>
            <div class="table-item"><p>Aikuiset</p></div>
            <div class="table-item"><p>Nuoret</p></div>
            <div class="table-item"><p>Lapset</p></div>
          </div>
          <div
            v-for="up in dp.groupRows"
            :key="up.user"
            :class="['kitchen-food-row', 'kitchen-food-detailed']"
          >
            <div class="user-header">
              <p>{{ up.user }}</p>
            </div>
            <div class="mini-row">
              <div class="header"><p>Normaalit</p></div>
              <div class="table-item">
                <p>{{ up.normal || 0 }}</p>
              </div>
              <div class="table-item">
                <p>{{ up.young || 0 }}</p>
              </div>
              <div class="table-item">
                <p>{{ up.child || 0 }}</p>
              </div>
            </div>
            <div v-if="up.special && up.special.length">
              <div
                class="mini-row"
                v-for="mr in up.special"
                :key="mr.allergies.join('-')"
              >
                <div class="header">
                  <p v-for="(a, i) in mr.allergies" :key="a">
                    {{ i === mr.allergies.length - 1 ? a : `${a},` }}
                  </p>
                </div>
                <div class="table-item">
                  <p>{{ mr.base === "normal" ? mr.count : 0 }}</p>
                </div>
                <div class="table-item">
                  <p>{{ mr.base === "young" ? mr.count : 0 }}</p>
                </div>
                <div class="table-item">
                  <p>{{ mr.base === "child" ? mr.count : 0 }}</p>
                </div>
              </div>
            </div>
            <div v-if="up.specialIds && up.specialIds.length">
              <div
                class="mini-row"
                v-for="mr in up.specialIds"
                :key="mr.allergies.join('-')"
              >
                <div class="header">
                  <p v-for="(a, i) in mr.allergies" :key="a">
                    {{ i === mr.allergies.length - 1 ? a : `${a},` }}
                  </p>
                </div>
                <div class="table-item">
                  <p>{{ mr.base === "normal" ? mr.count : 0 }}</p>
                </div>
                <div class="table-item">
                  <p>{{ mr.base === "young" ? mr.count : 0 }}</p>
                </div>
                <div class="table-item">
                  <p>{{ mr.base === "child" ? mr.count : 0 }}</p>
                </div>
              </div>
            </div>
          </div>
          <div :class="['kitchen-food-row', 'kitchen-food-totals']">
            <div class="header">
              <p>Yhteensä</p>
            </div>
            <div class="table-item">
              <p>{{ dp.totals.normal }}</p>
            </div>
            <div class="table-item">
              <p>{{ dp.totals.young }}</p>
            </div>
            <div class="table-item">
              <p>{{ dp.totals.child }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { mapState, mapGetters, mapActions } from "vuex";
import MiniTabChooser from "./MiniTabChooser.vue";
import DateDayFunc from "../DateDayFunctions";
import {
  DMonth,
  TMonth,
  Price,
  AllergyProfile,
  SpecialFoodWithId,
  AllergyEditorProfile,
  ApiCallStatus,
  DateDay,
  Day as DayType,
  Food,
  KitchenDay,
  AllUsers,
  SpecialFood,
  UserFood,
} from "../types";
import _ from "lodash";
import dateDayFunctions from "../DateDayFunctions";
import Loading from "./Loading.vue";

type LocalPrice = {
  fod: "lunch" | "coffee" | "dinner";
  name: string;
  special: boolean;
};

type Counts = {
  normal: number;
  young: number;
  child: number;
};

type CategoryRow = {
  name: string;
  counts: Counts;
};

type GroupedPrices = LocalPrice & {
  normalRows: CategoryRow;
  specialRows: CategoryRow[];
  totals: Counts;
};

type DetUserFood = UserFood & {
  user: string;
};

type DetailedPrices = LocalPrice & {
  groupRows: DetUserFood[];
  totals: Counts;
};

type LocalSpecials = SpecialFood & {
  sortKey: string;
};

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

const calcTotal = (
  key: "normal" | "young" | "child",
  food: UserFood[]
): number =>
  food.reduce(
    (acc, uf) =>
      acc +
      (uf[key] || 0) +
      (uf.special && uf.special.length
        ? uf.special.reduce((a, sf) => a + (sf.base === key ? sf.count : 0), 0)
        : 0) +
      (uf.specialIds && uf.specialIds.length
        ? uf.specialIds.reduce(
            (a, sf) => a + (sf.base === key ? sf.count : 0),
            0
          )
        : 0),
    0
  );

@Component({
  computed: {
    ...mapState({
      loading: "apiCall",
      allUsers: "allUsers",
      dayData: "kitchenDay",
    }),
    ...mapGetters({
      prices: "choosedMonthPriceData",
    }),
    date() {
      return this.$route.params.day;
    },
  },
  methods: {
    ...mapActions({
      setDay: "updateKitchenDay",
      updateAllUsers: "updateAllUsers",
    }),
    redirectTo(path: string) {
      this.$router.replace(path);
    },
  },
  components: { MiniTabChooser, Loading },
})
export default class Kitchen extends Vue {
  loading!: ApiCallStatus;
  date!: string;
  dayData!: KitchenDay;
  prices!: Price[];
  allUsers!: AllUsers;
  setDay!: (dateDay: DateDay) => void;
  redirectTo!: (path: string) => void;
  updateAllUsers!: () => Promise<void>;

  choosedValue = 0;
  onChange(newVal: number) {
    this.choosedValue = newVal;
  }

  mounted() {
    if (
      this.dayObj.year === -1 ||
      this.dayObj.month === -1 ||
      this.dayObj.day === -1
    )
      this.redirectTo("/cal");
    this.setDay({
      month: this.dayObj.month,
      year: this.dayObj.year,
      day: this.dayObj.day,
    });
    this.updateAllUsers();
  }

  get isLoading() {
    return this.loading.kitchen + this.loading.price + this.loading.user;
  }

  get dayObj(): DateDay {
    const splitted = this.date.split("-");
    return {
      year: Number(splitted[0]) ? Math.floor(Number(splitted[0])) : -1,
      month: Number(splitted[1])
        ? Math.floor((Number(splitted[1]) - 1) % 12)
        : -1,
      day: Number(splitted[2]) ? Math.floor(Number(splitted[2])) : -1,
    };
  }

  get basePrices(): LocalPrice[] {
    const dailyPrices = this.prices.filter(
      (p) =>
        dateDayFunctions.isLessOrEqual(p.start, this.dayObj) &&
        dateDayFunctions.isGreaterOrEqual(p.end, this.dayObj)
    );
    return [
      ...(dailyPrices.filter((p) => p.fod === "lunch").some((p) => p.special)
        ? dailyPrices.filter((p) => p.fod === "lunch" && p.special)
        : dailyPrices.filter((p) => p.fod === "lunch")),
      ...(dailyPrices.filter((p) => p.fod === "coffee").some((p) => p.special)
        ? dailyPrices.filter((p) => p.fod === "coffee" && p.special)
        : dailyPrices.filter((p) => p.fod === "coffee")),
      ...(dailyPrices.filter((p) => p.fod === "dinner").some((p) => p.special)
        ? dailyPrices.filter((p) => p.fod === "dinner" && p.special)
        : dailyPrices.filter((p) => p.fod === "dinner")),
    ].map((p) => ({ fod: p.fod, special: p.special, name: p.name }));
  }

  get groupedPrices(): GroupedPrices[] {
    return this.basePrices.map((bp) => {
      if (this.dayData && this.isLoading === 0) {
        const food = this.dayData[bp.fod];
        if (food) {
          const normalRows: CategoryRow = {
            name: "Normaalit",
            counts: {
              normal: food.reduce((acc, uf) => acc + (uf.normal || 0), 0),
              young: food.reduce((acc, uf) => acc + (uf.young || 0), 0),
              child: food.reduce((acc, uf) => acc + (uf.child || 0), 0),
            },
          };
          const specials: LocalSpecials[] = _.flatten(
            food.map((uf) => {
              const spes: SpecialFood[] = uf.special || [];
              const spesIds: SpecialFood[] = uf.specialIds || [];
              return spes.concat(spesIds);
            })
          ).map((sf) => {
            const allergies = sf.allergies.sort();
            return {
              ...sf,
              allergies,
              sortKey: allergies.join(", "),
            };
          });
          const grouped = _.groupBy(specials, "sortKey");
          const specialRows: CategoryRow[] = Object.keys(grouped)
            .sort()
            .map((key) => {
              const group = grouped[key];
              return {
                name: key,
                counts: {
                  normal: group
                    .filter((ls) => ls.base === "normal")
                    .reduce((acc, ls) => acc + ls.count, 0),
                  young: group
                    .filter((ls) => ls.base === "young")
                    .reduce((acc, ls) => acc + ls.count, 0),
                  child: group
                    .filter((ls) => ls.base === "child")
                    .reduce((acc, ls) => acc + ls.count, 0),
                },
              };
            });
          const totals: Counts = specialRows.concat(normalRows).reduce(
            (acc, cr) => ({
              normal: cr.counts.normal + acc.normal,
              young: cr.counts.young + acc.young,
              child: cr.counts.child + acc.child,
            }),
            { normal: 0, young: 0, child: 0 }
          );
          return {
            ...bp,
            normalRows,
            specialRows,
            totals,
          };
        }
      }
      return {
        ...bp,
        normalRows: {
          name: "Normaalit",
          counts: {
            normal: 0,
            young: 0,
            child: 0,
          },
          allergies: [],
        },
        specialRows: [],
        totals: {
          normal: 0,
          young: 0,
          child: 0,
        },
      };
    });
  }

  get detailedPrices(): DetailedPrices[] {
    return this.basePrices.map((bp) => {
      if (this.dayData && this.isLoading === 0) {
        const food = this.dayData[bp.fod];
        if (food) {
          const groupRows = food
            .map((uf, i) => {
              const userList = this.allUsers.users.filter(
                (u) => u.id === uf.userId
              );
              return {
                ...uf,
                user: userList.length
                  ? userList[0].name
                  : `Nimeä ${i} ei löytynyt, päivitä sivu`,
              };
            })
            .sort((a, b) => {
              if (a.user < b.user) return 1;
              if (a.user > b.user) return -1;
              return 0;
            });
          return {
            ...bp,
            totals: {
              normal: calcTotal("normal", food),
              young: calcTotal("young", food),
              child: calcTotal("child", food),
            },
            groupRows,
          };
        }
      }
      return {
        ...bp,
        totals: {
          normal: 0,
          young: 0,
          child: 0,
        },
        groupRows: [],
      };
    });
  }
}
</script>
<style lang="scss">
@import "../themes.scss";

.kitchen-elem {
  p {
    margin: 0;
  }
  .kitchen-food {
    border: 2px solid black;
    border-radius: 1rem;
    overflow: hidden;
    margin: 0.5rem 0;
    @include themed() {
      border-color: t($lines);
      background: t($secondarybg);
    }
    .kitchen-food-row {
      border-top: 1px solid black;
      display: flex;
      padding: 0.4rem 0 0.4rem 0.6rem;
      @include themed() {
        border-color: t($lines);
      }
      .table-item {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 3rem;
        flex-grow: 0;
        flex-shrink: 0;
      }
      .header {
        flex-grow: 1;
        display: flex;
        flex-wrap: wrap;
        justify-content: start;
        p {
        }
      }
    }
    .kitchen-food-header {
      border-top: none;
      border-bottom: 1px solid black;
      @include themed() {
        border-color: t($lines);
      }
      .table-item {
        font-size: 0.6rem;
      }
      font-weight: bold;
    }
    .kitchen-food-detailed {
      padding-left: 0;
      display: block;
      .mini-row {
        display: flex;
        padding-left: 0.6rem;
        &:nth-child(2n) {
          @include themed() {
            background: t($secondary);
          }
        }
      }
    }
    .kitchen-food-totals {
      border-top: 2px solid black;
      font-weight: bold;
      @include themed() {
        border-color: t($lines);
      }
    }
    &.special-food {
      .kitchen-food-header {
        @include themed() {
          background: t($primary);
        }
      }
    }
  }
}
</style>
