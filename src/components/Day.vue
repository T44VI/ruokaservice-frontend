<template>
  <div>
    <div v-if="isLoading"><Loading /></div>
    <div v-else>
      <div v-for="(food, i) in presDayData" :key="food.fod" class="food">
        <div class="food-header">
          <p class="food-header-name">{{ food.name }}</p>
          <p class="food-header-time">{{ food.time }}</p>
          <p>Nabi</p>
        </div>
        <div class="food-content">
          <div
            v-for="(price, j) in food.prices"
            :key="j"
            class="food-content-price"
            :class="[
              price.priceEdited ? 'new-price' : 'no-new-price',
              !price.base && !price.allergyProfileID
                ? 'price-editable'
                : 'no-price-editable',
            ]"
          >
            <div
              class="text-div"
              @click="
                !price.base &&
                  !price.allergyProfileID &&
                  openAllergyEditor(i, j)
              "
            >
              <p>{{ price.name || baseNames(price.baseAge) }}</p>
              <p v-if="!price.base">{{ price.allergies.join(", ") }}</p>
            </div>

            <NumPicker
              :value="price.count"
              :onChange="onchangeFunc(i, j)"
              :class="[price.countEdited ? 'new-count' : 'no-new-count']"
            />
          </div>
          <div
            class="food-content-price add-special"
            @click="openAllergyEditor(i)"
          >
            <p>Lisää erityisruokavaliollinen</p>
            <div class="add">
              <p>+</p>
            </div>
          </div>
          <div
            class="summary"
            :class="[
              food.prices.some((a) => a.priceEdited || a.countEdited)
                ? 'edited'
                : 'not-edited',
            ]"
          >
            <p>Yhteensä</p>
            <p>{{ food.prices.reduce((acc, pr) => acc + pr.count, 0) }}</p>
          </div>
        </div>
      </div>
      <transition name="slide-fade">
        <div class="day-footer" v-show="edited">
          <button @click="reset()">Kumoa</button>
          <button @click="save()" class="colored">Tallenna</button>
        </div>
      </transition>
      <div class="day-footer-fake"></div>
      <LocalWindow
        :isOpen="allergyEditorOpen"
        :close="closeAllergyEditor"
        :header="'Eritysruokavalioeditori 9000'"
      >
        <AllergyEditor :profile="allergyProfile" :onChange="updateAllergy" />
      </LocalWindow>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { mapState, mapGetters, mapActions } from "vuex";
import NumPicker from "./NumPicker.vue";
import AllergyEditor from "./AllergyEditor.vue";
import LocalWindow from "./LocalWindow.vue";
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
} from "../types";
import _ from "lodash";
import Loading from "./Loading.vue";

type LocalPrices = {
  name?: string;
  baseAge: "normal" | "young" | "child";
  count: number;
  base: boolean;
  allergyProfileID?: string;
  allergies: string[];
  priceEdited?: boolean;
  countEdited?: boolean;
};

type LocalFood = {
  name: string;
  time: string;
  basePrices: {
    normal: number;
    young: number;
    child: number;
  };
  fod: "lunch" | "coffee" | "dinner";
  prices: LocalPrices[];
};

const genEmptyAllergyProfile = (): AllergyEditorProfile => {
  return {
    base: "normal",
    allergies: [],
  };
};

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

@Component({
  computed: {
    ...mapState({
      loading: "apiCall",
    }),
    ...mapGetters({
      monthData: "choosedMonthData",
      prices: "choosedMonthPriceData",
      profiles: "getUserProfiles",
    }),
    date() {
      return this.$route.params.day;
    },
  },
  methods: {
    ...mapActions({
      setMonth: "changeMonthTo",
      saveDay: "saveDay",
    }),
    redirectTo(path: string) {
      this.$router.replace(path);
    },
  },
  components: { NumPicker, AllergyEditor, LocalWindow, Loading },
})
export default class Day extends Vue {
  loading!: ApiCallStatus;
  date!: string;
  monthData!: TMonth;
  prices!: Price[];
  profiles!: AllergyProfile[];
  setMonth!: (month: DMonth) => void;
  saveDay!: (data: { theDay: DayType; dateDay: DateDay }) => Promise<void>;
  redirectTo!: (path: string) => void;

  localDayData: LocalFood[] = [];
  allergyEditorOpen = false;
  choosedAllergyEditorProfile = {
    food: -1,
    price: -1,
  };
  openAllergyEditor(foodIndex: number, priceIndex?: number) {
    this.allergyEditorOpen = true;
    if (priceIndex && !!(priceIndex + 1)) {
      this.choosedAllergyEditorProfile = {
        food: foodIndex,
        price: priceIndex,
      };
    } else {
      this.choosedAllergyEditorProfile = {
        food: foodIndex,
        price: -1,
      };
    }
  }

  closeAllergyEditor() {
    this.allergyEditorOpen = false;
  }

  mounted() {
    if (
      this.dayObj.year === -1 ||
      this.dayObj.month === -1 ||
      this.dayObj.day === -1
    )
      this.redirectTo("/cal");
    this.setMonth({ month: this.dayObj.month, year: this.dayObj.year });
  }

  changeLocalDayData(i: number, j: number, val: number) {
    if (!this.localDayData.length) {
      this.localDayData = _.cloneDeep(this.vuexDayData);
    }
    this.localDayData[i].prices[j].count = val;
  }

  onchangeFunc(i: number, j: number): (val: number) => void {
    return (val: number) => this.changeLocalDayData(i, j, val);
  }

  reset() {
    this.localDayData = [];
  }

  save() {
    const theDay: DayType = {
      num: this.dayObj.day,
    };
    this.localDayData.forEach((lf) => {
      const food: Food = {};
      lf.prices.forEach((lp) => {
        if (lp.base) {
          if (lp.count > 0) {
            food[lp.baseAge] = lp.count;
          }
          return;
        }
        if (lp.count === 0) {
          return;
        }
        if (lp.allergyProfileID && lp.allergyProfileID.length > 0) {
          const prof = {
            specialId: lp.allergyProfileID,
            base: lp.baseAge,
            count: lp.count,
            allergies: lp.allergies,
            name: lp.name || "",
          };
          if (!food.specialIds) {
            food.specialIds = [prof];
          } else {
            food.specialIds.push(prof);
          }
          return;
        }
        const allergy = {
          base: lp.baseAge,
          count: lp.count,
          allergies: lp.allergies,
        };
        if (!food.special) {
          food.special = [allergy];
        } else {
          food.special.push(allergy);
        }
      });
      if (_.keys(food).length > 0) {
        theDay[lf.fod] = food;
      }
    });
    this.saveDay({ theDay, dateDay: this.dayObj });
  }

  get isLoading() {
    return this.loading.month + this.loading.price;
  }

  get choosedAllergyStatus(): { valid: boolean; new: boolean } {
    const { food, price } = this.choosedAllergyEditorProfile;
    if (food < 0) {
      return {
        valid: false,
        new: false,
      };
    }
    return {
      valid: true,
      new:
        price < 0 ||
        ((!this.localDayData.length ||
          !this.localDayData[food].prices[price]) &&
          (!this.vuexDayData.length || !this.vuexDayData[food].prices[price])),
    };
  }

  updateAllergy(newVal: AllergyEditorProfile) {
    const { food, price } = this.choosedAllergyEditorProfile;
    if (!this.choosedAllergyStatus.valid) {
      return;
    }
    if (this.localDayData.length === 0)
      this.localDayData = _.cloneDeep(this.vuexDayData);
    if (this.choosedAllergyStatus.new) {
      const newPrice = this.localDayData[food].prices.length;
      this.choosedAllergyEditorProfile.price = newPrice;
      this.localDayData[food].prices[newPrice] = {
        baseAge: newVal.base,
        count: 1,
        base: false,
        allergies: newVal.allergies,
      };
    } else {
      this.localDayData = [
        ...this.localDayData.slice(0, food),
        {
          ...this.localDayData[food],
          prices: [
            ...this.localDayData[food].prices.slice(0, price),
            {
              ...this.localDayData[food].prices[price],
              baseAge: newVal.base,
              allergies: newVal.allergies,
            },
            ...this.localDayData[food].prices.slice(price + 1),
          ],
        },
        ...this.localDayData.slice(food + 1),
      ];
    }
  }

  baseNames(baseAge: "normal" | "young" | "child") {
    switch (baseAge) {
      case "normal":
        return "Aikuinen";
      case "young":
        return "Nuori (12-24)";
      case "child":
        return "Lapsi (4-11)";
    }
  }

  private vuexStateError() {
    this.localDayData = [];
  }

  get allergyProfile(): AllergyEditorProfile {
    if (this.choosedAllergyStatus.valid) {
      if (this.choosedAllergyStatus.new) {
        return genEmptyAllergyProfile();
      }
      const { baseAge, allergies } =
        this.localDayData.length > 0
          ? this.localDayData[this.choosedAllergyEditorProfile.food].prices[
              this.choosedAllergyEditorProfile.price
            ]
          : this.vuexDayData[this.choosedAllergyEditorProfile.food].prices[
              this.choosedAllergyEditorProfile.price
            ];
      return {
        base: baseAge,
        allergies,
      };
    }
    this.choosedAllergyEditorProfile = {
      food: -1,
      price: -1,
    };
    return genEmptyAllergyProfile();
  }

  get edited() {
    return this.presDayData.some((lf) =>
      lf.prices.some((lp) => lp.priceEdited || lp.countEdited)
    );
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

  get dayPrices(): Price[] {
    const prices = this.prices.filter(
      (p) =>
        (p.start.year < this.dayObj.year ||
          (p.start.year === this.dayObj.year &&
            (p.start.month < this.dayObj.month ||
              (p.start.month === this.dayObj.month &&
                p.start.day <= this.dayObj.day)))) &&
        (p.end.year > this.dayObj.year ||
          (p.end.year === this.dayObj.year &&
            (p.end.month > this.dayObj.month ||
              (p.end.month === this.dayObj.month &&
                p.end.day >= this.dayObj.day))))
    );
    return [
      prices.find((p) => p.fod === "lunch" && p.special) ||
        prices.find((p) => p.fod === "lunch"),
      prices.find((p) => p.fod === "coffee" && p.special) ||
        prices.find((p) => p.fod === "coffee"),
      prices.find((p) => p.fod === "dinner" && p.special) ||
        prices.find((p) => p.fod === "dinner"),
    ].filter(notEmpty);
  }

  get presDayData(): LocalFood[] {
    if (!this.localDayData.length) return this.vuexDayData;
    try {
      return this.vuexDayData.map((lf, i) => {
        if (this.localDayData && this.localDayData[i]) {
          const { name, time, prices, basePrices, fod } = this.localDayData[i];
          if (lf.name !== name || lf.time !== time || lf.fod !== fod) {
            throw new Error("State error");
          }
          const mappedPrices = prices.map((lp, j) => {
            return {
              ...lp,
              priceEdited:
                (!lf.prices[j] && lp.count !== 0) ||
                (lf.prices[j] &&
                  (lf.prices[j].allergies.length !== lp.allergies.length ||
                    !lf.prices[j].allergies.every((st) =>
                      lp.allergies.includes(st)
                    ))),
              countEdited:
                (!lf.prices[j] && lp.count !== 0) ||
                (lf.prices[j] && lf.prices[j].count !== lp.count),
            };
          });
          return {
            name,
            time,
            fod,
            basePrices,
            prices: mappedPrices,
          };
        } else {
          throw Error("State Error");
        }
      });
    } catch (e) {
      console.log(e);
      this.vuexStateError();
      return [];
    }
  }

  get vuexDayData(): LocalFood[] {
    if (this.dayPrices.length) {
      const genEmpty = (): LocalFood[] => {
        return this.dayPrices.map(
          (val): LocalFood => ({
            name: val.name,
            time: val.time,
            fod: val.fod,
            basePrices: {
              normal: val.normal,
              young: val.young,
              child: val.child,
            },
            prices: [
              {
                count: 0,
                baseAge: "normal" as "normal",
                base: true,
                allergies: [] as string[],
              },
              {
                count: 0,
                baseAge: "young" as "young",
                base: true,
                allergies: [] as string[],
              },
              {
                count: 0,
                baseAge: "child" as "child",
                base: true,
                allergies: [] as string[],
              },
            ].concat(
              this.profiles.map((prof) => ({
                name: prof.name || prof.base,
                count: 0,
                baseAge: prof.base,
                base: false,
                allergyProfileID: prof.id,
                allergies: prof.allergies,
              }))
            ),
          })
        );
      };
      if (!this.monthData) {
        return genEmpty();
      }
      const filtered = this.monthData.days.filter(
        (d) => d.num === this.dayObj.day
      );
      if (filtered.length === 0) {
        return genEmpty();
      }
      if (filtered.length === 1) {
        return genEmpty().map((lf) => {
          const food = filtered[0][lf.fod];
          if (!food) {
            return lf;
          }
          const res = _.cloneDeep(lf);
          res.prices[0].count = food.normal || 0;
          res.prices[1].count = food.young || 0;
          res.prices[2].count = food.child || 0;
          if (food && food.specialIds && food.specialIds.length > 0) {
            this.profiles
              .map((pro, index): {
                id: string;
                index: number;
                obj: SpecialFoodWithId | undefined;
              } => ({
                id: pro.id,
                index,
                obj:
                  food &&
                  food.specialIds &&
                  food.specialIds.find((st) => st.specialId === pro.id),
              }))
              .forEach((el) => {
                if (el && el.obj) {
                  res.prices[el.index + 3] = {
                    name: el.obj.name,
                    baseAge: el.obj.base,
                    count: el.obj.count,
                    base: false,
                    allergyProfileID: el.obj.specialId,
                    allergies: el.obj.allergies,
                  };
                }
              });
            food.specialIds
              .filter(
                (s) => !this.profiles.map((pro) => pro.id).includes(s.specialId)
              )
              .forEach((el) => {
                res.prices.push({
                  name: el.name,
                  baseAge: el.base,
                  count: el.count,
                  base: false,
                  allergies: el.allergies,
                });
              });
          }
          if (food.special && food.special.length) {
            res.prices.push(
              ...food.special.map((sf) => {
                return {
                  base: false,
                  baseAge: sf.base,
                  count: sf.count,
                  allergies: sf.allergies,
                };
              })
            );
          }
          return res;
        });
      }
      return [];
    }
    return [];
  }
}
</script>
<style lang="scss">
.food {
  .food-header {
    display: flex;
    border: 2px solid black;
    border-radius: 0.5rem 0.5rem 0 0;
    p {
      margin: 0.5rem;
    }
    .food-header-name {
      flex-grow: 1;
      text-align: left;
    }
  }
  .food-content {
    border: 2px solid black;
    border-radius: 0 0 0.5rem 0.5rem;
    border-top: none;
    margin-bottom: 1rem;
    .food-content-price {
      display: flex;
      padding: 1rem;
      align-items: center;
      border-top: 1px solid black;
      &:first-child {
        border-top: none;
      }
      .text-div {
        flex-grow: 1;
        p {
          text-align: left;
          margin: 0;
        }
      }
      p {
        flex-grow: 1;
        text-align: left;
        margin: 0;
      }
      &.price-editable {
        .text-div {
          cursor: pointer;
          user-select: none;
        }
      }
      &.new-price.price-editable {
        background: repeating-linear-gradient(
          45deg,
          yellow,
          yellow 20px,
          lightcoral 20px,
          lightcoral 40px
        );
        transition: background 0.3s;
      }
      &.no-new-price.price-editable {
        background: yellow;
        transition: background 0.3s;
      }
      &.new-price.no-price-editable {
        background: lightcoral;
        transition: background 0.3s;
      }
      &.no-new-price.no-price-editable {
        background: white;
        transition: background 0.3s;
      }
      .new-count {
        background: lightcoral;
        transition: background 0.3s;
      }
      .no-new-count {
        background: white;
        transition: background 0.3s;
      }
    }
    .add-special {
      color: black;
      user-select: none;
      cursor: pointer;
      .add {
        font-size: 1.4rem;
        border: 2px solid black;
        margin: 0 0.5rem;
        width: 1.5rem;
        height: 1.5rem;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 1rem;
        p {
          text-align: center;
        }
      }
    }
    .summary {
      border-radius: 0 0 0.4rem 0.4rem;
      display: flex;
      padding: 0.5rem;
      border-top: 2px solid black;
      align-items: center;
      &.edited {
        background: lightcoral;
        transition: background 0.3s;
      }
      &.not-edited {
        background: white;
        transition: background 0.3s;
      }
      p {
        font-weight: bold;
        margin: 0 1rem;
        &:first-child {
          flex-grow: 1;
          text-align: left;
        }
      }
    }
  }
}
.day-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  height: 3.6rem;
  width: 100%;
  background: white;
  border-top: 2px solid black;
  display: flex;
  align-items: center;
  justify-content: space-around;
  button {
    width: 40%;
    border-radius: 10px;
  }
  .day-save {
    background: lightcoral;
  }
  .day-reset {
  }
}
.day-footer-fake {
  height: 3.2rem;
  width: 100%;
}
.slide-fade-enter-active {
  transition: all 0.5s ease;
}
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateY(20px);
  opacity: 0;
}
</style>
