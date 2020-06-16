<template>
  <div class="price-editor">
    <div class="row input-row" v-if="isSpecial">
      <p>Nimi:</p>
      <input v-model="name" />
    </div>
    <div class="row">
      <MiniTabChooser
        :keys="fodKeyArr"
        :onChange="changeFod"
        :choosedValue="fodIndex"
      />
    </div>
    <div class="row">
      <MiniTabChooser
        :keys="['Kertaluontoinen', 'Jatkuva']"
        :onChange="setContinuity"
        :choosedValue="continuity"
      />
    </div>
    <div class="row component-row">
      <p class="comp-header">
        {{ continuity === 1 ? "Aloituspäivä" : "Päivämäärä" }}:
      </p>
      <CalPicker
        :dateDay="startDay"
        :onChange="changeStartDay"
        :blocked="startDaysBlocked"
      />
    </div>
    <div class="row component-row" v-if="continuity === 1">
      <p class="comp-header">Lopetuspäivä:</p>
      <CalPicker
        :dateDay="endDay"
        :onChange="changeEndDay"
        :blocked="endDaysBlocked"
      />
    </div>
    <div class="row input-row short-input" v-if="isSpecial">
      <p>Ajankohta:</p>
      <input v-model="time" />
    </div>
    <div class="row wrapper">
      <p class="wrapper-header">Hinnat (€)</p>
      <div class="wrapper-content">
        <div class="row input-row">
          <p>Aikuinen:</p>
          <input v-model="normal" type="float" />
        </div>
        <div class="row input-row">
          <p>Nuori:</p>
          <input v-model="young" type="float" />
        </div>
        <div class="row input-row">
          <p>Lapsi:</p>
          <input v-model="child" type="float" />
        </div>
      </div>
    </div>
    <div v-if="errormessage.length > 0" class="row">
      <p>{{ errormessage }}</p>
    </div>
    <div class="price-editor-buttons">
      <button @click="reset()">Resetoi</button>
      <button @click="save()" class="colored">Tallenna</button>
    </div>
  </div>
</template>
<script lang="ts">
import "reflect-metadata";
import { Vue, Component, Prop } from "vue-property-decorator";
import _ from "lodash";
import MiniTabChooser from "./MiniTabChooser.vue";
import LocalWindow from "./LocalWindow.vue";
import CalPicker from "./CalPicker.vue";
import { Price, DateDay, PriceEditorBase, DateDayBlock } from "../types";
import dateDayFunctions from "../DateDayFunctions";

type Fod = "lunch" | "coffee" | "dinner";

type LocalPrice = {
  fod?: "lunch" | "coffee" | "dinner";
  special?: boolean;
  name?: string;
  time?: string;
  normal?: number;
  young?: number;
  child?: number;
  start?: DateDay;
  end?: DateDay;
};

const fodKeys: { fod: Fod; key: string; time: string }[] = [
  {
    fod: "lunch",
    key: "Lounas",
    time: "12:00",
  },
  {
    fod: "coffee",
    key: "Päiväkahvi",
    time: "15:00",
  },
  {
    fod: "dinner",
    key: "Illallinen",
    time: "18:00",
  },
];

const getFodIndex = (fod: Fod): number =>
  fod === "lunch" ? 0 : fod === "coffee" ? 1 : 2;

@Component({
  components: {
    MiniTabChooser,
    LocalWindow,
    CalPicker,
  },
})
export default class PriceEditor extends Vue {
  @Prop() readonly price!: PriceEditorBase;
  @Prop() readonly onChange!: (newVal: Price) => void;
  @Prop() readonly year!: number;
  @Prop() readonly blockedDateDays!: DateDayBlock[];
  @Prop() readonly isSpecial!: boolean;

  id = "";
  name = "";
  normal = 0;
  young = 0;
  child = 0;
  time = "";
  fodIndex = fodKeys.length;
  changeFod(newVal: number) {
    this.fodIndex = newVal;
  }
  fodKeyArr = fodKeys.map((a) => a.key);
  startDay: DateDay = {
    year: this.year,
    month: new Date().getMonth(),
    day: -1,
  };
  changeStartDay(val: DateDay) {
    this.startDay = val;
  }
  endDay: DateDay = { year: this.year, month: new Date().getMonth(), day: -1 };
  changeEndDay(val: DateDay) {
    this.endDay = val;
  }

  continuity = 0;
  setContinuity(newVal: number) {
    this.continuity = newVal;
  }

  isNewValue = true;
  mounted() {
    this.reset();
  }

  errormessage = "";

  reset() {
    this.errormessage = "";
    if (this.price.price) {
      const {
        id,
        name,
        fod,
        normal,
        young,
        child,
        start,
        end,
        time,
      } = this.price.price;
      this.id = id;
      this.name = name;
      this.fodIndex = getFodIndex(fod);
      this.normal = normal / 100;
      this.young = young / 100;
      this.child = child / 100;
      if (
        start.year === end.year &&
        start.month === end.month &&
        start.day === end.day
      ) {
        this.continuity = 0;
        this.endDay = {
          year: this.year,
          month: new Date().getMonth(),
          day: -1,
        };
      } else {
        this.continuity = 1;
        this.endDay = end;
      }
      this.startDay = start;
      this.isNewValue = false;
      this.time = time;
    } else {
      this.id = "";
      this.name = "";
      this.fodIndex = fodKeys.length;
      this.normal = 0;
      this.young = 0;
      this.child = 0;
      this.continuity = 2;
      this.startDay = {
        year: this.year,
        month: new Date().getMonth(),
        day: -1,
      };
      this.endDay = {
        year: this.year,
        month: new Date().getMonth(),
        day: -1,
      };
      this.time = "";
    }
  }

  validate(): Price | string {
    if (this.fodIndex !== 0 && this.fodIndex !== 1 && this.fodIndex !== 2) {
      return "Ruoka on valittava";
    }
    const id = this.id;
    const name = this.isSpecial ? this.name : fodKeys[this.fodIndex].key;
    if (!name.length) {
      return "Nimi ei voi olla tyhjä";
    }
    const fod = fodKeys[this.fodIndex].fod;
    const start = this.startDay;
    const end = this.continuity === 0 ? this.startDay : this.endDay;
    if (dateDayFunctions.isGreaterThan(start, end)) {
      return "Aloituspäivä ei voi olla lopetuspäivän jälkeen";
    }
    if (
      this.blockedByFod.some(
        (b) =>
          (dateDayFunctions.isLessOrEqual(b.start, start) &&
            dateDayFunctions.isGreaterOrEqual(b.end, start)) ||
          (dateDayFunctions.isLessOrEqual(b.start, end) &&
            dateDayFunctions.isGreaterOrEqual(b.end, end)) ||
          (dateDayFunctions.isGreaterThan(b.start, start) &&
            dateDayFunctions.isLessThan(b.start, end))
      )
    ) {
      return "Aikajänne on jo varattu";
    }
    const time = this.isSpecial ? this.time : fodKeys[this.fodIndex].time;
    if (time.length > 5 || !time.includes(":")) {
      return "Anna aika muodossa HH:MM";
    }
    const normal = Math.round(this.normal * 100);
    const young = Math.round(this.young * 100);
    const child = Math.round(this.child * 100);
    if (!(normal + 1) || !(young + 1) || !(child + 1)) {
      return "Hinnat eivät kelvanneet. Muista käyttää pistettä desimaalierottimena!";
    }
    if (normal % 1 || young % 1 || child % 1) {
      return "Senttiä pienempää arvoa ei voi antaa hintaan";
    }
    if (normal < 0 || young < 0 || child < 0) {
      return "Negatiivista hintaa ei voi antaa";
    }
    return {
      id,
      fod,
      start,
      end,
      time,
      normal,
      young,
      child,
      name,
      special: this.isSpecial,
    };
  }

  save() {
    const validated = this.validate();
    if (typeof validated === "string") {
      this.errormessage = validated;
    } else {
      this.onChange(validated);
    }
  }

  get blockedByFod() {
    if (this.fodIndex >= fodKeys.length || this.fodIndex < 0) {
      return [];
    }
    return this.blockedDateDays.filter(
      (b) => b.fod === fodKeys[this.fodIndex].fod
    );
  }

  get startDaysBlocked() {
    if (this.endDay.day === -1 || this.continuity !== 1) {
      return this.blockedByFod;
    }
    return this.blockedByFod.concat({
      end: { year: this.year, month: 11, day: 31 },
      start: this.endDay,
      fod: "lunch",
    });
  }

  get endDaysBlocked() {
    if (this.startDay.day === -1) {
      return this.blockedByFod;
    }
    return this.blockedByFod.concat({
      start: { year: this.year, month: 0, day: 1 },
      end: this.startDay,
      fod: "lunch",
    });
  }
}
</script>
<style lang="scss">
@import "../themes.scss";

.price-editor {
  .price-editor-buttons {
    border-top: 2px solid black;
    @include themed() {
      border-color: t($lines);
    }
    button {
      width: 40%;
    }
  }
  p {
    margin: 0;
  }
  .row {
    &:first-child {
      margin-top: 0.5rem;
    }
    margin: 1rem 0;
    &.input-row {
      display: flex;
      align-items: center;
      p {
        margin: 0.2rem;
      }
      input {
        flex-grow: 1;
      }
    }
    &.component-row {
      display: flex;
      align-items: center;
      .comp-header {
        flex-grow: 1;
        text-align: left;
      }
    }
    &.wrapper {
      .wrapper-header {
        text-align: left;
        font-weight: bolder;
      }
      .wrapper-content {
        padding-left: 2rem;
        .input-row {
          &:first-child {
            margin-top: 0;
          }
          justify-content: space-between;
          input {
            width: 4rem;
            flex-grow: 0;
          }
        }
      }
    }
    &.short-input {
      justify-content: space-between;
      input {
        width: 5rem;
        flex-grow: 0;
      }
    }
  }
}
</style>
