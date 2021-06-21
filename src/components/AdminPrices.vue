<template>
  <div class="admin-price">
    <div v-if="isLoading"><Loading /></div>
    <div v-else class="loaded-content">
      <div class="header">
        <p>Normaalit ruoat</p>
      </div>
      <div class="price-content">
        <div v-for="price in basicPrices" :key="price.id" class="row">
          <div class="first-row">
            <p>{{ price.name }}</p>
            <button @click="openPriceEditor(false, price)">Muokkaa</button>
          </div>
          <div class="second-row">
            <div
              v-for="data in dataSchema.filter(p => !p.specialOnly)"
              :key="data.key"
              class="data-item"
            >
              <div class="data-item-value">
                <p>
                  {{ data.func ? data.func(price[data.key]) : price[data.key] }}
                </p>
              </div>
              <div class="data-item-key">
                <p>{{ data.header }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="add-new" @click="openPriceEditor(false)">
          <p>Lisää uusi</p>
          <div class="add">
            <p>+</p>
          </div>
        </div>
      </div>
      <div class="header">
        <p>Spesiaali ruoat</p>
      </div>
      <div class="price-content">
        <div v-for="price in specialPrices" :key="price.id" class="row">
          <div class="first-row">
            <p>{{ price.name }}</p>
            <button @click="openPriceEditor(true, price)">Muokkaa</button>
          </div>
          <div class="second-row">
            <div v-for="data in dataSchema" :key="data.key" class="data-item">
              <div class="data-item-value">
                <p>
                  {{ data.func ? data.func(price[data.key]) : price[data.key] }}
                </p>
              </div>
              <div class="data-item-key">
                <p>{{ data.header }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="add-new" @click="openPriceEditor(true)">
          <p>Lisää uusi</p>
          <div class="add">
            <p>+</p>
          </div>
        </div>
      </div>
    </div>
    <LocalWindow
      :isOpen="priceEditorOpen"
      :close="closePriceEditor"
      :header="'Hintahieroja 2.0'"
    >
      <PriceEditor
        :price="priceEditorBase"
        :onChange="savePrice"
        :year="adminData.year"
        :blockedDateDays="dateDayBlocks"
        :isSpecial="priceEditorSpecial"
      />
    </LocalWindow>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import _ from 'lodash';
import { mapState, mapGetters, mapActions } from 'vuex';
import {
  AdminData,
  Price,
  ApiCallStatus,
  DateDay,
  PriceEditorBase,
  DateDayBlock
} from '../types';
import LocalWindow from './LocalWindow.vue';
import PriceEditor from './PriceEditor.vue';
import Loading from './Loading.vue';

type DataItem = {
  key: string;
  header: string;
  func?: (a: any) => string;
  specialOnly?: boolean;
};

const numToMoney = (num: number): string => {
  const eur = Math.floor(num / 100);
  const cent = num % 100;
  return `${eur},${cent < 10 ? `0${cent}` : cent} €`;
};

const months = [
  'Tammik.',
  'Helmik.',
  'Maalisk.',
  'Huhtik.',
  'Toukok.',
  'Kesäk.',
  'Heinäk.',
  'Elok.',
  'Syysk.',
  'Lokak.',
  'Marrask.',
  'Jouluk.'
];

@Component({
  computed: {
    ...mapState({
      adminData: 'admin',
      apiCall: 'apiCall'
    }),
    ...mapGetters({
      prices: 'adminGetYearPrices'
    })
  },
  methods: {
    ...mapActions({
      setYear: 'changeAdminYear',
      updatePrice: 'editPrice'
    })
  },
  components: {
    LocalWindow,
    PriceEditor,
    Loading
  }
})
export default class AdminPrice extends Vue {
  adminData!: AdminData;
  apiCall!: ApiCallStatus;
  prices!: Price[];
  setYear!: (year: number) => void;
  updatePrice!: (val: Price) => void;

  priceEditorOpen = false;
  priceEditorSpecial = false;
  priceEditorBase: PriceEditorBase = {};
  dataSchema: DataItem[] = [
    {
      key: 'start',
      header: 'Alkaen',
      func: (val: DateDay) => `${val.day} ${months[val.month]}`
    },
    {
      key: 'end',
      header: 'Päättyy',
      func: (val: DateDay) => `${val.day} ${months[val.month]}`
    },
    {
      key: 'fod',
      header: 'Ruoka',
      func: (val: 'lunch' | 'coffee' | 'dinner') => {
        switch (val) {
          case 'lunch':
            return 'Lounas';
          case 'coffee':
            return 'Päiväkahvi';
          case 'dinner':
            return 'Illallinen';
        }
      },
      specialOnly: true
    },
    {
      key: 'normal',
      header: 'Aikuinen',
      func: numToMoney
    },
    {
      key: 'discount',
      header: 'Alennettu',
      func: numToMoney
    },
    {
      key: 'young',
      header: 'Nuori',
      func: numToMoney
    },
    {
      key: 'child',
      header: 'Lapsi',
      func: numToMoney
    },
    {
      key: 'time',
      header: 'Kello',
      specialOnly: true
    }
  ];

  mounted() {
    this.setYear(new Date().getFullYear());
  }

  openPriceEditor(isSpecial: boolean, price?: Price) {
    this.priceEditorBase = { price };
    this.priceEditorSpecial = isSpecial;
    this.priceEditorOpen = true;
  }

  closePriceEditor() {
    this.priceEditorOpen = false;
  }

  savePrice(price: Price) {
    this.updatePrice(price);
    this.closePriceEditor();
  }

  get basicPrices() {
    return this.prices.filter(price => !price.special);
  }
  get specialPrices() {
    return this.prices.filter(price => price.special);
  }
  get isLoading() {
    return !!this.apiCall.price;
  }

  get dateDayBlocks(): DateDayBlock[] {
    const priceList = this.priceEditorSpecial
      ? this.specialPrices
      : this.basicPrices;
    return priceList
      .filter(
        p =>
          !this.priceEditorBase.price || p.id !== this.priceEditorBase.price.id
      )
      .map(p => ({ start: p.start, end: p.end, fod: p.fod }));
  }
}
</script>
<style lang="scss">
@import '../themes.scss';

.admin-price {
  .loaded-content {
    .header {
      font-size: 1.4rem;
      text-align: left;
      font-weight: 100;
      p {
        margin: 1rem 0 0 0;
      }
    }
  }
  .price-content {
    border: 2px solid black;
    border-radius: 0.5rem;
    overflow: hidden;
    @include themed() {
      border-color: t($lines);
      background: t($secondarybg);
    }
    .row {
      border-bottom: 1px solid black;
      @include themed() {
        border-color: t($lines);
      }
      .first-row {
        display: flex;
        align-items: center;
        p {
          flex-grow: 1;
          font-size: 1.2rem;
          font-weight: bold;
        }
      }
      .second-row {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-evenly;
      }
    }
  }
  .data-item {
    margin: 0.3rem;
    p {
      margin: 0;
    }
    .data-item-value {
      font-weight: bolder;
      padding: 0.4rem;
      @include themed() {
        background: t($secondary);
      }
    }
    .data-item-key {
      font-size: 0.8rem;
      padding: 0.2rem;
      @include themed() {
        background: t($neutraltextbg);
      }
    }
  }
  .add-new {
    user-select: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    p {
      flex-grow: 1;
      margin: 0.8rem;
    }
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

      @include themed() {
        border-color: t($lines);
      }
      p {
        text-align: center;
      }
    }
  }

  input {
    background: transparent;
    @include themed() {
      color: t($text);
    }
  }
}
</style>
