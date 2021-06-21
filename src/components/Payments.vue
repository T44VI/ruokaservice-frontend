paymentDateOnChange<template>
  <div class="payments">
    <div v-if="isLoading">
      <Loading />
    </div>
    <div v-else>
      <div class="payments-table">
        <div class="payments-header">Maksut</div>
        <div class="payments-content" ref="content">
          <div>
            <div class="payments-item" v-for="pay in sorted" :key="pay.name">
              <div class="header">
                <p>{{ dateDayToString(pay.date) }}</p>
                <p>{{ pay.name }}</p>
              </div>
              <div class="amount" :class="[pay.amount < 0 ? 'negative' : '']">
                <p>{{ numToEuros(pay.amount) }} €</p>
              </div>
            </div>
          </div>
        </div>
        <div class="payments-total">
          <div class="header">
            <p>Yhteensä</p>
          </div>
          <div class="amount" :class="[total < 0 ? 'negative' : '']">
            <p>{{ numToEuros(total) }} €</p>
          </div>
        </div>
      </div>
      <button class="colored" @click="openAdder()">Uusi maksu</button>
    </div>
    <LocalWindow
      :isOpen="adderOpen"
      :close="closeAdder"
      :header="'Lisää uusi maksu'"
    >
      <p v-if="errorMessage">{{ errorMessage }}</p>
      <p>Maksun nimi</p>
      <input v-model="newPaymentName" />
      <p>Päivämäärä</p>
      <div class="centerContent">
        <CalPicker
          :dateDay="newPaymentDate"
          :onChange="paymentDateOnChange"
          :blocked="[]"
        />
      </div>
      <p>Maksun määrä (€) - Muista käyttää pistettä desimaalierottimena!</p>
      <input v-model.number="newPaymentAmount" />
      <div class="allergy-buttons">
        <button @click="reset()">Tyhjennä</button>
        <button class="colored" @click="confirmAddNew()">Tallenna</button>
      </div>
    </LocalWindow>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import _ from 'lodash';
import { mapState, mapGetters, mapActions } from 'vuex';
import {
  AdminData,
  Price,
  ApiCallStatus,
  DateDay,
  PriceEditorBase,
  DateDayBlock,
  AllPayments
} from '../types';
import LocalWindow from './LocalWindow.vue';
import Loading from './Loading.vue';
import CalPicker from './CalPicker.vue';
import dateDayFunctions from '../DateDayFunctions';

const scrollToBottom = (el: HTMLElement) => {
  console.log(el);

  console.log(el.scrollTop, el.scrollHeight);
};

@Component({
  computed: {
    ...mapState({
      apiCall: 'apiCall',
      payments: 'payments'
    })
  },
  methods: {
    ...mapActions({
      getPayments: 'getPayments',
      savePayment: 'savePayment'
    })
  },
  components: {
    LocalWindow,
    Loading,
    CalPicker
  }
})
export default class Payments extends Vue {
  apiCall!: ApiCallStatus;
  payments!: AllPayments;
  getContentElem!: () => HTMLElement;
  getPayments!: (year: number) => Promise<void>;
  savePayment!: (payment: {
    dateDay: DateDay;
    amount: number;
    name: string;
    id?: string;
  }) => Promise<void>;

  $refs!: {
    content: HTMLElement;
  };

  newPaymentName = '';
  newPaymentAmount = 0;
  newPaymentDate: DateDay = dateDayFunctions.today();
  errorMessage = '';

  paymentDateOnChange(newVal: DateDay) {
    this.newPaymentDate = newVal;
  }

  numToEuros(num: number): string {
    if (num < 0) {
      return `-${this.numToEuros(-num)}`;
    }
    return `${Math.floor(num * 0.01)}.${
      num % 100 < 10 ? `0${num % 100}` : num % 100
    }`;
  }

  dateDayToString(d: DateDay): string {
    return `${d.year}-${d.month + 1 < 10 ? `0${d.month + 1}` : d.month + 1}-${
      d.day < 10 ? `0${d.day}` : d.day
    }`;
  }

  @Watch('payments')
  onPaymentsChanged(val: AllPayments, oldVal: AllPayments) {
    if (val.ts !== oldVal.ts) {
      this.$nextTick(() => {
        if (this.$refs.content)
          this.$refs.content.scrollTop = this.$refs.content.scrollHeight;
      });
    }
  }

  reset() {
    this.newPaymentName = '';
    this.newPaymentAmount = 0;
    this.errorMessage = '';
  }
  confirmAddNew() {
    this.errorMessage = '';
    if (this.newPaymentName.length === 0) {
      this.errorMessage = 'Maksulla on oltava nimi.';
      return;
    }
    if (!this.newPaymentAmount || this.newPaymentAmount <= 0) {
      this.errorMessage = 'Maksulla on oltava positiivinen määrä.';
      return;
    }
    const d = new Date();
    this.savePayment({
      dateDay: this.newPaymentDate,
      name: this.newPaymentName,
      amount: Math.round(this.newPaymentAmount * 100)
    });
    this.reset();
    this.closeAdder();
  }

  get sorted() {
    return this.payments.payments.sort((a, b) => {
      if (dateDayFunctions.isLessThan(a.date, b.date)) return -1;
      if (dateDayFunctions.isGreaterThan(a.date, b.date)) return 1;
      return 0;
    });
  }

  adderOpen = false;
  openAdder() {
    this.adderOpen = true;
  }
  closeAdder() {
    this.adderOpen = false;
  }

  mounted() {
    this.getPayments(new Date().getFullYear());
  }

  get isLoading() {
    return this.apiCall.payments;
  }

  get total() {
    return this.payments.payments.reduce((acc, p) => acc + p.amount, 0);
  }
}
</script>
<style lang="scss">
@import '../themes.scss';

.payments {
  .centerContent {
    display: flex;
    justify-content: center;
  }

  .payments-table {
    .payments-header {
      font-size: 1.2rem;
      font-weight: bold;
      border: 2px solid black;
      border-bottom: none;
      padding: 0.5rem;
      border-radius: 1rem 1rem 0 0;

      @include themed() {
        border-color: t($lines);

        background: t($secondarybg);
      }
    }
    .payments-content {
      max-height: 60vh;
      overflow-y: scroll;
      border: 2px solid black;
      @include themed() {
        border-color: t($lines);
        background: t($secondarybg);
      }
      .header {
        display: flex;
        align-items: center;
        p {
          flex-grow: 1;
          &:first-child {
            flex-grow: 0;
          }
        }
      }
      .payments-item {
        display: flex;
        border-top: 1px solid black;
        padding: 0.1rem 0.4rem;
        min-height: 3rem;
        @include themed() {
          border-color: t($lines);
        }
        &:first-child {
          border-top: none;
        }
      }
    }
    .payments-total {
      display: flex;
      border: 2px solid black;
      border-top: none;
      border-radius: 0 0 1rem 1rem;
      font-weight: bold;
      padding: 0.1rem 0.4rem;
      @include themed() {
        border-color: t($lines);
        background: t($secondarybg);
      }
    }
    .header {
      flex-grow: 1;
    }
    .amount {
      width: 4rem;
      border: 1px solid black;
      padding: 0.2rem 0.6rem;
      margin: 0.2rem;
      border-radius: 0.5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-grow: 0;
      flex-shrink: 0;
      p {
        margin: 0;
      }

      @include themed() {
        border-color: t($lines);
        background: t($success);
        &.negative {
          background: t($fail);
        }
      }
    }
  }
}
</style>
