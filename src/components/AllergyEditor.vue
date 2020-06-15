<template>
  <div class="allergy-editor">
    <MiniTabChooser
      :keys="keys"
      :onChange="onBaseChange"
      :choosedValue="choosedTab"
    />
    <transition name="appear">
      <div v-if="choosedAllergies.length > 0">
        <p class="allergy-header">Valitut erityisruokavaliot</p>
        <transition-group name="allergiesIn" tag="div" class="allergy-content">
          <div
            v-for="(allergy, i) in choosedAllergies"
            :key="allergy"
            class="allergy-item added"
            @click="removeAllergy(i)"
          >
            <p>{{ allergy }}</p>
            <p>-</p>
          </div>
        </transition-group>
      </div>
    </transition>
    <p class="allergy-header">Lisää erityisruokavaliot</p>
    <transition-group name="allergiesOut" tag="div" class="allergy-content">
      <div
        v-for="allergy in freeAllergies"
        :key="allergy"
        class="allergy-item"
        @click="addAllergy(allergy)"
      >
        <p>{{ allergy }}</p>
        <p>+</p>
      </div>
      <div class="allergy-item" @click="addNew()" key="addNew">
        <p>Lisää uusi</p>
        <p>+</p>
      </div>
    </transition-group>
    <LocalWindow
      :isOpen="newWindowOpen"
      :close="closeNewWindow"
      :header="'Uusi erityisruokavalio'"
    >
      <input v-model="newWindowInput" placeholder="Erityisruokavalio" />
      <div class="allergy-buttons">
        <button @click="closeNewWindow()">
          Kumoa
        </button>
        <button class="colored" @click="confirmAddNew()">
          Tallenna
        </button>
      </div>
    </LocalWindow>
  </div>
</template>
<script lang="ts">
import "reflect-metadata";
import { Vue, Component, Prop } from "vue-property-decorator";
import _ from "lodash";
import MiniTabChooser from "./MiniTabChooser.vue";
import LocalWindow from "./LocalWindow.vue";
import { AllergyEditorProfile, State } from "../types";
import { mapState, mapGetters } from "vuex";

const numberTranslator: ("normal" | "young" | "child")[] = [
  "normal",
  "young",
  "child",
];
const baseTranslator = {
  normal: 0,
  young: 1,
  child: 2,
};

@Component({
  computed: {
    ...mapGetters({
      allergies: "getAllergies",
    }),
  },
  components: {
    MiniTabChooser,
    LocalWindow,
  },
})
export default class AllergyEditor extends Vue {
  allergies!: string[];
  @Prop() readonly profile!: AllergyEditorProfile;
  @Prop() readonly onChange!: (newVal: AllergyEditorProfile) => void;
  newWindowOpen = false;
  newWindowInput = "";

  keys = ["Aikuinen", "Nuori", "Lapsi"];
  onBaseChange(newVal: number) {
    this.onChange({ ...this.profile, base: numberTranslator[newVal] });
  }

  addAllergy(allergy: string) {
    this.onChange({
      ...this.profile,
      allergies: this.profile.allergies.concat(allergy),
    });
  }

  removeAllergy(index: number) {
    this.onChange({
      ...this.profile,
      allergies: [
        ...this.profile.allergies.slice(0, index),
        ...this.profile.allergies.slice(index + 1),
      ],
    });
  }

  addNew() {
    this.newWindowOpen = true;
    this.newWindowInput = "";
  }

  confirmAddNew() {
    this.addAllergy(this.newWindowInput);
    this.closeNewWindow();
  }

  closeNewWindow() {
    this.newWindowOpen = false;
  }

  get freeAllergies() {
    return this.allergies.filter(
      (all) => !this.profile.allergies.includes(all)
    );
  }

  get choosedTab() {
    return baseTranslator[this.profile.base];
  }

  get choosedAllergies() {
    return this.profile.allergies;
  }
}
</script>
<style lang="scss">
.allergy-editor {
  .allergy-content {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
    overflow: hidden;
    .allergy-item {
      background: lightcoral;
      display: flex;
      margin: 0.2rem;
      padding: 0.5rem 0.7rem;
      border-radius: 1.5rem;
      user-select: none;
      cursor: pointer;
      p {
        font-size: 1rem;
        margin: 0;
        &:first-child {
          margin-right: 0.5rem;
        }
      }
      &.added {
        background: lightgreen;
      }
    }
  }
  .allergy-header {
    border-bottom: solid black 1px;
    text-align: left;
    margin: 1rem 0;
    font-size: 1.2rem;
  }
  input {
    width: 90%;
    font-size: 1.1rem;
    margin: 1rem 0;
  }
  .allergy-buttons {
    display: flex;
    align-items: center;
    justify-content: space-around;
    button {
      width: 40%;
    }
  }
}
.allergiesIn-enter-active,
.allergiesIn-leave-active,
.allergiesOut-enter-active,
.allergiesOut-leave-active {
  transition: all 0.3s;
}
.allergiesOut-enter, .allergiesOut-leave-to /* .list-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translateY(-30px);
}
.allergiesIn-enter, .allergiesIn-leave-to /* .list-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translateY(30px);
}
.appear-enter-active,
.appear-leave-active {
  transition: all 0.3s;
}
.appear-enter,
.appear-leave-to {
  height: 0px;
  opacity: 0;
  .allergy-header {
    margin: 0;
  }
}
</style>
