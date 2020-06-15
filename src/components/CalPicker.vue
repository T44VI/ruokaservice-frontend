<template>
  <div class="cal-picker">
    <div
      class="cal-picker-display"
      @click="openEditor()"
      :class="[currentDayBlocked ? 'current-blocked' : '']"
    >
      <div class="cal-picker-event">
        <div class="cal-picker-event-first">
          <p>{{ isNewValue ? "-" : this.dateDay.day }}</p>
        </div>
        <div class="cal-picker-event-second">
          <p>Päivä</p>
        </div>
      </div>
      <div class="cal-picker-event">
        <div class="cal-picker-event-first">
          <p>
            {{ isNewValue ? "-" : getMonthString(this.dateDay.month, true) }}
          </p>
        </div>
        <div class="cal-picker-event-second">
          <p>Kuukausi</p>
        </div>
      </div>
      <div class="cal-picker-event">
        <div class="cal-picker-event-first">
          <p>{{ this.dateDay.year }}</p>
        </div>
        <div class="cal-picker-event-second">
          <p>Vuosi</p>
        </div>
      </div>
    </div>
    <LocalWindow
      :isOpen="editorOpen"
      :close="closeEditor"
      :header="'Päiväpoimija 3000'"
    >
      <div class="cal-picker-nav">
        <button
          :class="[openMonth === 0 ? 'disabled' : '']"
          @click="changeMonth(-1)"
        >
          &larr;
        </button>
        <p>{{ getMonthString(openMonth) }}</p>
        <button
          :class="[openMonth === 11 ? 'disabled' : '']"
          @click="changeMonth(1)"
        >
          &rarr;
        </button>
      </div>
      <div class="cal-picker-month">
        <div class="cal-picker-week" v-for="(week, i) in calendarRows" :key="i">
          <div
            class="cal-picker-day"
            :class="
              [day.day === 0 ? 'cal-picker-dayless' : ' '].concat(day.classes)
            "
            v-for="(day, index) in week"
            :key="i + index"
            @click="confirmDay(day.day, day.blocked)"
          >
            <div v-if="day.day === 0"></div>
            <div v-else>
              <p>{{ day.day }}</p>
            </div>
          </div>
        </div>
      </div>
    </LocalWindow>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import _ from "lodash";
import LocalWindow from "./LocalWindow.vue";
import { DateDay, DateDayBlock } from "../types";

type LocalDay = {
  day: number;
  classes: string[];
  blocked: boolean;
};

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

const monthsShort = [
  "Tammik.",
  "Helmik.",
  "Maalisk.",
  "Huhtik.",
  "Toukok.",
  "Kesäk.",
  "Heinäk",
  "Elok.",
  "Syysk.",
  "Lokak.",
  "Marrask.",
  "Jouluk.",
];

@Component({
  components: {
    LocalWindow,
  },
})
export default class CalPicker extends Vue {
  @Prop() readonly dateDay!: DateDay;
  @Prop() readonly onChange!: (newVal: DateDay) => void;
  @Prop() readonly blocked!: DateDayBlock[];

  openMonth = this.dateDay.month;

  editorOpen = false;
  closeEditor() {
    this.editorOpen = false;
  }
  openEditor() {
    this.editorOpen = true;
  }

  get isNewValue() {
    return this.dateDay.day < 1;
  }

  getMonthString(m: number, short = false) {
    return short ? monthsShort[m] : months[m];
  }

  confirmDay(day: number, blocked: boolean) {
    if (day === 0 || blocked) {
      return;
    }
    this.onChange({
      year: this.dateDay.year,
      month: this.openMonth,
      day,
    });
    this.closeEditor();
  }

  changeMonth(change: number) {
    const nextMonth = this.openMonth + change;
    if (nextMonth <= 11 && nextMonth >= 0) {
      this.openMonth = nextMonth;
    }
  }

  isDayBlocked(day: number): boolean {
    if (day < 1) {
      return false;
    }
    return this.blocked.some(
      (block) =>
        (block.start.year < this.dateDay.year ||
          (block.start.year === this.dateDay.year &&
            (block.start.month < this.openMonth ||
              (block.start.month === this.openMonth &&
                block.start.day <= day)))) &&
        (block.end.year > this.dateDay.year ||
          (block.end.year === this.dateDay.year &&
            (block.end.month > this.openMonth ||
              (block.end.month === this.openMonth && block.end.day >= day))))
    );
  }

  get calendarRows(): LocalDay[][] {
    const startDay =
      (new Date(this.dateDay.year, this.openMonth, 1).getDay() + 6) % 7;
    const daysOfMonth = new Date(
      this.dateDay.year,
      this.openMonth + 1,
      0
    ).getDate();
    const weeks = Math.ceil((startDay + daysOfMonth) / 7);
    const res: LocalDay[][] = [];
    for (let i = 0; i < weeks; i++) {
      res.push(
        [1, 2, 3, 4, 5, 6, 7]
          .map((val) => val - startDay + i * 7)
          .map((val) => (val > daysOfMonth || val < 1 ? 0 : val))
          .map((val) => {
            const isBlocked = this.isDayBlocked(val);
            const classes = [
              this.dateDay.month === this.openMonth && this.dateDay.day === val
                ? "choosed-day"
                : "",
              isBlocked ? "blocked-day" : "",
            ];
            return {
              day: val,
              classes,
              blocked: isBlocked,
            };
          })
      );
    }
    return res;
  }

  get currentDayBlocked() {
    return this.isDayBlocked(this.dateDay.day);
  }
}
</script>
<style lang="scss">
.cal-picker {
  .cal-picker-nav {
    display: flex;
    padding-bottom: 0.2rem;
    border-bottom: 2px solid black;
    align-items: center;
    button {
      margin: 0;
      border-radius: 0;
      border: none;
      &:first-child {
        border-right: 2px solid black;
      }
      &:last-child {
        border-left: 2px solid black;
      }
    }
    p {
      flex-grow: 1;
      font-size: 1.2rem;
    }
  }
  .cal-picker-display {
    cursor: pointer;
    user-select: none;
    display: flex;
    align-items: center;
    .cal-picker-event {
      border: 1px solid black;
      border-left: none;
      padding: 0;
      overflow: hidden;
      &:first-child {
        border-radius: 0.5rem 0 0 0.5rem;
        border-left: 1px solid black;
      }
      &:last-child {
        border-radius: 0 0.5rem 0.5rem 0;
      }
      .cal-picker-event-first {
        padding: 0.2rem 0.4rem;
        p {
          margin: 0;
          font-weight: bolder;
        }
      }
      .cal-picker-event-second {
        font-size: 0.7rem;
        background: lightgray;
        padding: 0.1rem 0.2rem;
        p {
          margin: 0;
        }
      }
    }

    &.current-blocked {
      .cal-picker-event-first {
        background: red;
      }
    }
  }
  .cal-picker-month {
    display: flex;
    flex-direction: column;
    height: 15rem;
    .cal-picker-week {
      flex-grow: 1;
      display: flex;
      .cal-picker-day {
        flex-grow: 1;
        background: lightblue;
        margin: 0.2rem;
        width: 5rem;
        font-size: 1.1rem;
        font-weight: bolder;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        user-select: none;
        p {
          margin: 0;
        }
        &.cal-picker-dayless {
          background: none;
        }
        &.blocked-day {
          background: lightgray;
          cursor: not-allowed;
        }
        &.choosed-day {
          background: blue;
        }
        &.blocked-day.choosed-day {
          background: red;
        }
      }
    }
  }
}
</style>
