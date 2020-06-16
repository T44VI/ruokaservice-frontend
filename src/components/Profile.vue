<template>
  <div class="profile">
    <div class="profile-allergy-list">
      <div v-for="prof in profiles" :key="prof.id" class="profile-allergy-item">
        <div class="text-holder">
          <p>{{ prof.name }}</p>
          <p>{{ prof.allergies.join(", ") }}</p>
        </div>
        <div class="button-holder">
          <button @click="openEditor(prof.id)">Muokkaa</button
          ><button class="colored">Poista</button>
        </div>
      </div>
      <div @click="openEditor()">
        <p>Lisää uusi</p>
      </div>
    </div>
    <LocalWindow
      :isOpen="editorOpen"
      :close="closeEditor"
      :header="'Erityisruokavalieditori 9001'"
      class="allergy-editor"
    >
      <div class="editor-scrollable">
        <div v-if="!!errormessage">
          <p>{{ errormessage }}</p>
        </div>
        <div class="row">
          <p>Nimi:</p>
          <input v-model="editedName" />
        </div>
        <div>
          <MiniTabChooser
            :keys="['Aikunen', 'Nuori', 'Lapsi']"
            :onChange="changeBase"
            :choosedValue="editedBase"
          />
        </div>
        <div>
          <transition name="appear">
            <div v-if="choosedAllergies.length > 0">
              <p class="allergy-header">Valitut erityisruokavaliot</p>
              <transition-group
                name="allergiesIn"
                tag="div"
                class="allergy-content"
              >
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
          <transition-group
            name="allergiesOut"
            tag="div"
            class="allergy-content"
          >
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
        </div>
      </div>
      <div class="bottom-button">
        <button class="colored" @click="saveChanges()">Tallenna</button>
      </div>
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
    </LocalWindow>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import _ from "lodash";
import { mapGetters, mapActions } from "vuex";
import { AllergyProfile } from "../types";
import LocalWindow from "./LocalWindow.vue";
import MiniTabChooser from "./MiniTabChooser.vue";

const genEmptyAllergyProfile = (): AllergyProfile => ({
  base: "normal",
  allergies: [],
  id: "",
  name: "",
});

const numberToBaseArr: ("normal" | "young" | "child")[] = [
  "normal",
  "young",
  "child",
];

@Component({
  computed: {
    ...mapGetters({
      profiles: "getUserProfiles",
      allergies: "getAllergies",
    }),
  },
  methods: {
    ...mapActions({
      saveProfile: "editAllergyProfile",
    }),
  },
  components: {
    LocalWindow,
    MiniTabChooser,
  },
})
export default class Profile extends Vue {
  profiles!: AllergyProfile[];
  allergies!: string[];
  saveProfile!: (prof: AllergyProfile) => Promise<void>;

  newWindowOpen = false;
  newWindowInput = "";

  editedName = "";
  editedBase = 3;
  editedId = "";
  choosedAllergies: string[] = [];
  errormessage = "";

  editorOpen = false;
  openEditor(id?: string) {
    if (id) {
      const editableProfile =
        this.profiles.find((p) => p.id === id) || genEmptyAllergyProfile();
      this.editedName = editableProfile.name;
      this.editedBase =
        editableProfile.base === "normal"
          ? 0
          : editableProfile.base === "young"
          ? 1
          : 2;
      this.editedId = id;
      this.choosedAllergies = editableProfile.allergies;
    } else {
      this.editedName = "";
      this.editedBase = 3;
      this.editedId = "";
      this.choosedAllergies = [];
    }
    this.editorOpen = true;
    this.errormessage = "";
  }
  closeEditor() {
    this.editorOpen = false;
  }
  changeBase(val: number) {
    this.editedBase = val;
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
  addAllergy(allergy: string) {
    this.choosedAllergies = this.choosedAllergies.concat(allergy);
  }
  removeAllergy(index: number) {
    this.choosedAllergies = [
      ...this.choosedAllergies.slice(0, index),
      ...this.choosedAllergies.slice(index + 1),
    ];
  }

  async saveChanges() {
    if (!this.editedName) {
      return (this.errormessage = "Nimi ei voi olla tyhjä");
    }
    if (
      this.editedBase !== 0 &&
      this.editedBase !== 1 &&
      this.editedBase !== 2
    ) {
      return (this.errormessage = "Ikä on valittava");
    }
    if (this.choosedAllergies.length === 0) {
      return (this.errormessage = "Jotain allergioita on valittava");
    }
    this.closeEditor();
    await this.saveProfile({
      id: this.editedId,
      name: this.editedName,
      base: numberToBaseArr[this.editedBase],
      allergies: this.choosedAllergies,
    });
  }

  get freeAllergies() {
    return this.allergies.filter((s) => !this.choosedAllergies.includes(s));
  }
}
</script>
<style lang="scss">
@import "../themes.scss";

.profile {
  .profile-allergy-list {
    border: 2px solid black;
    border-radius: 10px;
    @include themed() {
      border-color: t($lines);
      background: t($secondarybg);
    }
    .profile-allergy-item {
      display: flex;
      border-bottom: 1px solid black;
      @include themed() {
        border-color: t($lines);
      }
      .text-holder {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        p {
          margin: 0.4rem;
          &:first-child {
            font-weight: bold;
            font-size: 1.1rem;
          }
        }
      }
      .button-holder {
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
      }
    }
  }

  .allergy-content {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
    overflow: hidden;
    .allergy-item {
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
      @include themed() {
        background: t($fail);
        &.added {
          background: t($success);
        }
      }
    }
  }
}
.allergy-editor {
  .editor-scrollable {
    max-height: calc(100vh - 11rem);
    overflow: scroll;
    .row {
      display: flex;
      align-items: center;
      p {
        margin: 0;
        margin-right: 1rem;
      }
      input {
        flex-grow: 1;
        background: transparent;
        @include themed() {
          color: t($text);
        }
      }
    }
  }
  .bottom-button {
    border-top: 2px solid black;

    @include themed() {
      border-color: t($lines);
    }
    button {
      width: 80%;
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
