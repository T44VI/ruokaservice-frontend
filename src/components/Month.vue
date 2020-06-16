<template>
  <div class="month-elem">
    <MiniTabChooser
      :keys="keys"
      :onChange="onChange"
      :choosedValue="choosedValue"
    />
    <div class="calendar">
      <div class="monthHeader">
        <div class="mh-button mh-left" v-on:click="changeMonth(-1)">&larr;</div>
        <div class="mh-middle">{{ `${monthName} ${month.year}` }}</div>
        <div class="mh-button mh-right" v-on:click="changeMonth(1)">&rarr;</div>
      </div>
      <div v-if="!!monthData">
        <div class="month-week" v-for="(week, i) in calendarRows" :key="i">
          <div
            class="month-day"
            :class="[day.num === 0 ? 'month-dayless' : '']"
            v-for="(day, index) in week"
            :key="i + index"
          >
            <div v-if="day.num === 0"></div>
            <router-link v-else :to="dayPressLink(day.num)">
              <div class="month-dayNum">{{ day.num ? day.num : " " }}</div>

              <div class="month-dayInfo" :class="day.special">
                <h4 v-if="day.num && choosedValue !== 1">
                  {{ day.eaters ? day.eaters : 0 }}
                </h4>
                <div
                  v-else-if="day.num && choosedValue === 1 && day.price"
                  class="price"
                >
                  <div>
                    <h4>
                      {{
                        Math.floor(day.price * 0.01)
                          ? Math.floor(day.price * 0.01)
                          : 0
                      }}
                    </h4>
                    <h4>
                      {{ day.price % 100 ? "." + (day.price % 100) : "" }}
                    </h4>
                  </div>
                  <div><h4>€</h4></div>
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </div>
      <div v-else><Loading /></div>
    </div>
    <div class="colorDesc">
      <div v-for="color in colors" class="colorDesc-color" :key="color.class">
        <div class="colorDesc-colorview" :class="color.class"></div>
        <p class="colorDesc-desc">{{ color.desc }}</p>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import _ from "lodash";
import { TMonth, Food, DMonth, Price, Day } from "../types";
import MiniTabChooser from "./MiniTabChooser.vue";
import Loading from "./Loading.vue";
import { mapGetters, mapState, mapMutations, mapActions } from "vuex";

type LocalDay = {
  num: number;
  eaters: number;
  price?: number;
  special: string[];
};

type ColorDesc = {
  class: string;
  desc: string;
};

const currentTime = new Date();

const sumCategories = (food: Food) =>
  (food.normal || 0) +
  (food.young || 0) +
  (food.child || 0) +
  (food.special ? food.special.reduce((acc, val) => acc + val.count, 0) : 0) +
  (food.specialIds
    ? food.specialIds.reduce((acc, val) => acc + val.count, 0)
    : 0);

const calculatePrices = (relevantPrices: Price[], day: Day): number => {
  const baseCats: ("normal" | "young" | "child")[] = [
    "normal",
    "young",
    "child",
  ];
  const baseFods: ("lunch" | "coffee" | "dinner")[] = [
    "lunch",
    "coffee",
    "dinner",
  ];
  const prices = baseFods.map((fod: "lunch" | "coffee" | "dinner"): number => {
    if (!day[fod]) {
      return 0;
    }
    const food: Food = day[fod] as Food;
    const filteredPrices = relevantPrices.filter((p) => p.fod === fod);
    if (filteredPrices.length === 0) {
      return 0;
    }
    const price = filteredPrices.some((p) => p.special)
      ? filteredPrices.filter((p) => p.special)[0]
      : filteredPrices[0];
    const counts = baseCats.map(
      (base: "normal" | "young" | "child") =>
        (food[base] || 0) +
        (food && food.special && food.special.length
          ? food.special.reduce(
              (acc, sid) => (sid.base === base ? acc + sid.count : acc),
              0
            )
          : 0) +
        (food && food.specialIds && food.specialIds.length
          ? food.specialIds.reduce(
              (acc, sid) => (sid.base === base ? acc + sid.count : acc),
              0
            )
          : 0)
    );
    return (
      price.normal * counts[0] +
      price.young * counts[1] +
      price.child * counts[2]
    );
  });
  return prices.reduce((acc: number, price: number) => acc + price, 0);
};

@Component({
  components: { MiniTabChooser, Loading },
  computed: {
    ...mapState({
      month: "choosedMonth",
    }),
    ...mapGetters({
      monthData: "choosedMonthData",
      prices: "choosedMonthPriceData",
    }),
  },
  methods: {
    ...mapActions(["changeMonth"]),
  },
})
export default class Month extends Vue {
  month!: DMonth;
  monthData!: TMonth;
  prices!: Price[];
  changeMonth!: (change: number) => void;

  keys = ["Syöjien määrä", "Hinta", "Kaikki"];
  onChange(val: number) {
    this.choosedValue = val;
  }
  choosedValue = 0;

  colors = [
    {
      class: "onlyCoffee",
      desc: "Vain kahvi",
    },
    {
      class: "allSame",
      desc: "Joka ruoalla sama määrä",
    },
    {
      class: "exception",
      desc: "Määrä vaihtuu päivän mittaan",
    },
    {
      class: "specialPrice",
      desc: "Erikoishinta",
    },
    {
      class: "noFood",
      desc: "Ei yhteisruokailua",
    },
  ];

  mounted() {
    this.changeMonth(0);
  }

  dayPressLink(day: number) {
    return {
      name: this.choosedValue === 2 ? "kitchen" : "day",
      params: {
        day: this.month.year + "-" + (this.month.month + 1) + "-" + day,
      },
    };
  }

  getLocalDay(day: number): LocalDay {
    const prices = this.prices.filter(
      (p) =>
        (p.start.year < this.month.year ||
          (p.start.year === this.month.year &&
            (p.start.month < this.month.month ||
              (p.start.month === this.month.month && p.start.day <= day)))) &&
        (p.end.year > this.month.year ||
          (p.end.year === this.month.year &&
            (p.end.month > this.month.month ||
              (p.end.month === this.month.month && p.end.day >= day))))
    );
    if (prices.length) {
      switch (this.choosedValue) {
        case 2: {
          const filteredAllDays = this.monthData.allDays.filter(
            (d) => d.num === day
          );
          if (filteredAllDays.length) {
            return {
              num: day,
              eaters: filteredAllDays.reduce((acc, cv) => acc + cv.count, 0),
              special: [
                prices.filter((p) => p.special).length ? "specialPrice" : "",
              ],
            };
          }
          break;
        }
        default: {
          const filtered = this.monthData.days.filter((d) => d.num === day);
          if (filtered.length) {
            const d = filtered[0];
            const lunch = d.lunch ? sumCategories(d.lunch) : 0;
            const coffee = d.coffee ? sumCategories(d.coffee) : 0;
            const dinner = d.dinner ? sumCategories(d.dinner) : 0;
            return {
              num: day,
              eaters: Math.max(lunch, coffee, dinner),
              price: calculatePrices(prices, d),
              special: [
                lunch === 0 && dinner === 0 && coffee > 0
                  ? "onlyCoffee"
                  : lunch === coffee && lunch === dinner && lunch > 0
                  ? "allSame"
                  : lunch !== coffee || lunch !== dinner
                  ? "exception"
                  : "",
                prices.filter((p) => p.special).length ? "specialPrice" : "",
              ],
            };
          }
        }
      }
      return {
        num: day,
        eaters: 0,
        special: [prices.filter((p) => p.special).length ? "specialPrice" : ""],
      };
    }
    return {
      num: day,
      eaters: 0,
      special: ["noFood"],
    };
  }

  get calendarRows(): LocalDay[][] {
    const days = new Date(this.month.year, this.month.month + 1, 0).getDate();
    const firstDay = new Date(this.month.year, this.month.month, 1);
    const res: LocalDay[][] = [[]];
    for (let i = 0; i < (firstDay.getDay() + 6) % 7; i++) {
      res[0][i] = this.getLocalDay(0);
    }
    res[0][(firstDay.getDay() + 6) % 7] = this.getLocalDay(1);
    for (let i = 2; i <= days; i++) {
      if (res[res.length - 1].length >= 7) {
        res.push([]);
      }
      res[res.length - 1].push(this.getLocalDay(i));
    }
    for (let i = res[res.length - 1].length; i < 7; i++) {
      res[res.length - 1].push(this.getLocalDay(0));
    }
    return res;
  }

  get monthName(): string {
    const months = [
      "Tammikuu",
      "Helmikuu",
      "Maaliskuu",
      "Huhtikuu",
      "Toukokuu",
      "Kesäkuu",
      "Heinäkuu",
      "Elokuu",
      "Syyskuu",
      "Lokakuu",
      "Marraskuu",
      "Joulukuu",
    ];
    return months[this.month.month];
  }
}
</script>
<style lang="scss">
@import "../themes.scss";

.month-elem {
  .month-week {
    display: flex;
    width: 100%;
    .month-day {
      flex-grow: 1;
      width: 5vw;
      margin: 3px;
      @include themed() {
        border-color: t($lines);
        background: t($bg);
      }
      &.month-dayless {
        background: transparent;
      }
    }
  }
  .month-dayNum {
    border-bottom: 1px solid black;
    @include themed() {
      background: t($neutraltextbg);
      color: t($text);
      border-color: t($oppositetext);
    }
    min-height: 1.5em;
  }
  .month-dayInfo {
    height: 5vh;
    display: flex;
    justify-content: center;
    align-items: center;
    .price {
      display: flex;
      height: 100%;
      width: 100%;
      div {
        display: flex;
        flex-direction: column;
        &:first-child {
          flex-grow: 1;
          justify-content: center;
          align-items: center;
          h4 {
            font-size: 1.2rem;
            font-weight: normal;
            &:nth-child(2) {
              font-size: 0.8rem;
            }
          }
        }
        &:nth-child(2) {
          justify-content: center;
          margin: 0.4rem;
        }
      }
    }
    @include themed() {
      &.onlyCoffee {
        background: t($secondary);
      }
      &.allSame {
        background: t($thirdiary);
      }
      &.exception {
        background: t($fifth);
      }
      &.noFood {
        background: t($neutraltextbg);
      }
      &.specialPrice {
        background: t($primary);
        &.exception {
          background: repeating-linear-gradient(
            45deg,
            t($primary),
            t($primary) 10px,
            t($fifth) 10px,
            t($fifth) 20px
          );
        }
        &.allSame {
          background: repeating-linear-gradient(
            45deg,
            t($primary),
            t($primary) 10px,
            t($thirdiary) 10px,
            t($thirdiary) 20px
          );
        }
        &.onlyCoffee {
          background: repeating-linear-gradient(
            45deg,
            t($primary),
            t($primary) 10px,
            t($secondary) 10px,
            t($secondary) 20px
          );
        }
      }
    }

    h4 {
      margin: 0;
      @include themed() {
        color: t($text);
      }
    }
  }
  .colorDesc {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    .colorDesc-color {
      display: flex;
      justify-content: center;
      align-items: center;
      .colorDesc-colorview {
        height: 2rem;
        width: 2rem;
        border: 2px solid black;
        margin: 0.2rem;
        @include themed() {
          background: t($secondarybg);

          border-color: t($lines);
          &.onlyCoffee {
            background: t($secondary);
          }
          &.allSame {
            background: t($thirdiary);
          }
          &.exception {
            background: t($fifth);
          }
          &.specialPrice {
            background: t($primary);
          }
          &.noFood {
            background: t($neutraltextbg);
          }
        }
      }
      .colorDesc-desc {
      }
    }
  }

  .calendar {
    border: 2px solid black;
    border-radius: 10px;
    overflow: hidden;
    margin-top: 1rem;
    @include themed() {
      background: t($secondarybg);
      border-color: t($lines);
    }
    .monthHeader {
      display: flex;
      font-size: 1.2rem;
      border-bottom: 2px solid black;
      @include themed() {
        background: t($primary);
        border-color: t($lines);
      }

      .mh-button {
        padding: 0.15rem 0.6rem;
        user-select: none;
        cursor: pointer;
        &:hover {
          @include themed() {
            background: t($secondary);
          }
        }
        &:active {
          @include themed() {
            background: t($oppositetext);
          }
        }
      }
      .mh-left {
        border-right: 2px solid black;
        @include themed() {
          border-color: t($lines);
        }
      }
      .mh-middle {
        flex-grow: 1;
        padding: 0.2rem;
      }
      .mh-right {
        border-left: 2px solid black;
        @include themed() {
          border-color: t($lines);
        }
      }
    }
  }
}
</style>
