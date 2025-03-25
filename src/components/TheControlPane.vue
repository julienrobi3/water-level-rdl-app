<template>
  <div>
    <!-- <div class="typeOfUserSelection general-button-container">
      <div class="typeOfUserButton general-selection-button" @click="activeTab = 'member'"
        :class="activeTab === 'member' ? 'activeUserTab' : ''">
        {{
          $t("member") }}</div>
      <div class="typeOfUserButton general-selection-button" @click="activeTab = 'visitor'"
        :class="activeTab === 'visitor' ? 'activeUserTab' : ''">{{
          $t("visitor") }}</div>
    </div> -->


    <!-- <div class="control-pane-tab" v-show="activeTab === 'member'">
      <div class="input-selector">
        <div class="selector-specific-text">{{ $t("specific-water-level") }}</div>
        <div class="input-selector-specific-wl">
          <div class="input-number-container">
            <div class="angle-button-container button-minus-left" @click="modifyWaterLevel(-1)">-</div>
            <input class="input-number" v-model.number="specificWaterLevel" type="number" v-on:input="emitConfig"
              onclick="this.select();" />

            <div class="angle-button-container button-plus-right" @click="modifyWaterLevel(1)">+</div>
          </div>

          <UnitsSelector></UnitsSelector>
        </div>
      </div>
      <div class="selector-specific-text"> {{ $t("select-date") }}</div>
      <div class="date-selector">
        <v-date-picker v-show="windowWidth > 850" v-model="dateSelected" />
        <v-date-picker v-show="windowWidth < 850" v-model="dateSelected">
          <template v-slot="{ inputValue, inputEvents }">
            <input class="calendar-input border px-2 py-1 rounded" :value="inputValue" v-on="inputEvents" />
          </template>
</v-date-picker>
</div>
</div> -->

    <!-- <div class="control-pane-tab" v-show="activeTab === 'visitor'"> -->
    <img id="marina-image" :src="require('@/assets/marina_rdl.webp')" />
    <div class="draught-selector">
      <div class="selector-specific-text">
        {{ $t("draught") }}
      </div>
      <div class="input-selector-specific-wl">
        <div class="input-number-container">
          <div class="angle-button-container button-minus-left" @click="modifyDraught(-1)">-</div>
          <input class="input-number" v-model.number="draught" type="number" v-on:input="emitConfig"
            onclick="this.select();" />
          <div class="angle-button-container button-plus-right" @click="modifyDraught(1)">+</div>

        </div>
        <UnitsSelector></UnitsSelector>
      </div>

    </div>
    <div class="destination-selector">
      <div class="selector-specific-text location-selector-text">
        {{ $t("boat-choice") }}
      </div>
      <!-- <div class="marina-image-container"><img id="marina-image" :src="require('@/assets/marina_rdl.png')"
          v-if="extandMarina" @click="extandMarina = false" /></div> -->
      <div class="general-button-container">
        <div class="general-selection-button destination-button"
          @click="function () { destinationSelected = marinaValue; emitConfig() }"
          :class="destinationSelected === marinaValue ? 'active-selection' : ''">
          Marina</div>
        <div class="general-selection-button destination-button"
          @click="function () { destinationSelected = visitorValue; emitConfig() }"
          :class="destinationSelected === visitorValue ? 'active-selection' : ''">{{ $t("visitor-dock") }}</div>
      </div>
      <!-- <div class="marina-layout-option" @click="extandMarina = !extandMarina">
          <div>{{ $t("marina-layout") }}</div>
          <img id="marina-image-small" :src="require('@/assets/marina_rdl.png')" />
        </div> -->
    </div>
    <div class="selector-specific-text"> {{ $t("select-date") }}</div>
    <div class="date-selector-and-buttons">
      <div @click="dayMinusOne" class="greater-smaller-sign" v-show="windowWidth < 850">&#60;</div>
      <div class="date-selector">
        <v-date-picker v-show="windowWidth > 850" v-model="dateSelected" />
        <v-date-picker v-show="windowWidth < 850" v-model="dateSelected">
          <template v-slot="{ inputValue, inputEvents }">
            <input class="calendar-input border px-2 py-1" :value="inputValue" v-on="inputEvents" />
          </template>
        </v-date-picker>
      </div>
      <div @click="dayPlusOne" class="greater-smaller-sign" v-show="windowWidth < 850">&#62;</div>
    </div>


    <!--  
    <div class="dot-and-text-container" v-show="windowWidth < 850">
      <div class="dot-wrapper">
        <div @click="dayMinusOne" class="greater-smaller-sign">
          &#60;
        </div>
        <div v-if="$store.state.selectedDate != null" class="day-info-container">
          <div>{{ getDay($store.state.selectedDate) }} {{ getDate($store.state.selectedDate) }}</div>
        </div>
        <div @click="dayPlusOne" class="greater-smaller-sign">
          &#62;
        </div>
      </div>
    </div> -->



  </div>
</template>

<script>
import { conversionFunctions } from "@/common/units-utils";
import { days, months } from "@/common/time-utils";
import {
  formatDateToDisplay,
  formatTimeToDisplay,
} from "@/common/timeRelatedFunctions";
import UnitsSelector from "@/components/UnitsSelector.vue";
export default {
  components: { UnitsSelector },
  computed: {
    visitorValue() {
      return this.visitorValues[this.$store.state.units];
    },
    marinaValue() {
      return this.marinaValues[this.$store.state.units];
    },
  },
  data() {
    let meterVisitorValue = 1.1;
    let meterMarinaValue = 2.1;
    let visitorValues = {
      meter: meterVisitorValue,
      foot: conversionFunctions.foot(meterVisitorValue),
    };
    let marinaValues = {
      meter: meterMarinaValue,
      foot: conversionFunctions.foot(meterMarinaValue),
    };
    let dateSelected = new Date()

    return {
      extandMarina: false,
      activeTab: "visitor",
      tabIndex: 0,
      specificWaterLevel: 6,
      draught: 4,
      marinaValues,
      visitorValues,
      destinationSelected: marinaValues[this.$store.state.units],
      dateSelected,
      windowWidth: window.innerWidth
    };
  },
  methods: {
    dayPlusOne: function () {

      this.$emit("dateChanged", 1)

    },
    dayMinusOne: function () {

      this.$emit("dateChanged", -1)
    },
    getDay: function (date) {
      return days[this.$i18n.locale][date.getDay()];
    },
    getDate: function (date) {
      let month = months[this.$i18n.locale][date.getMonth()];
      let day = date.getDate();
      return day + " " + month;
    },
    calculateDiffDays: function (first, second) {
      const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
      return Math.round(Math.abs((first - second) / oneDay));
    },
    emitConfig: function () {
      let config = {};
      config["draught"] = this.draught;
      config["selectedDate"] = new Date(this.dateSelected.setHours(0, 0, 0, 0));
      config["destination"] = parseFloat(this.destinationSelected);
      config["specificWaterLevel"] = this.specificWaterLevel === "" ? 0 : this.specificWaterLevel;
      this.$emit("config", config);
    },
    modifyWaterLevel: function (modif) {
      this.specificWaterLevel = this.specificWaterLevel + modif
      this.emitConfig()
    },
    modifyDraught: function (modif) {
      this.draught = this.draught + modif
      this.$emit("draught", this.draught);
    },


  },
  mounted() {
    let _this = this;

    // let _this = this;
    // async function mount() {
    //   await _this.handleInput();
    // }
    // mount();
    this.emitConfig()
  },
  watch: {
    "$store.state.selectedDate": function (newValue) {
      this.dateSelected = new Date(newValue)
    },
    dateSelected: function () {
      let date = new Date(this.dateSelected.setHours(0, 0, 0, 0))
      if (date.getTime() != this.$store.state.selectedDate.getTime()) {
        this.emitConfig();
      }

    },
    activeTab: function () {
      this.$emit("waterLevelType", this.activeTab);
    },
    "$store.state.units": function (newValue) {
      this.draught = conversionFunctions[newValue](this.draught);
      this.specificWaterLevel = conversionFunctions[newValue](
        this.specificWaterLevel
      );
      this.destinationSelected = conversionFunctions[newValue](
        this.destinationSelected
      );

      this.emitConfig();
    },
  },
};
</script>

<style>
.vc-pane-container {
  background-color: #eef2f4 !important;
  border-radius: 10px;
  border: 1px solid #092230;
}

.vc-highlight {
  background-color: #092230 !important;
}

@media (min-width: 850px) {
  .vc-day {
    min-height: 23px !important;
  }

  .vc-day-content {
    width: 23px !important;
    height: 23px !important;
    line-height: 23px !important;
  }

  .vc-highlight {
    width: 25px !important;
    height: 25px !important;
  }

  .vc-highlights {
    overflow: visible !important;
  }

  .vc-header {
    padding: 5px 10px 0 10px !important;
  }
}


.vc-container {
  border: none !important;
}

.dates-chosen-and-calendar {
  display: flex;
  justify-content: center;
  align-items: center;
}

.popover-header {
  background-color: #1a4269 !important;
  color: white !important;
}

.draught-selector {
  display: block;
  /* margin: 10px 20px 0px 20px; */
}

.input-number-container {
  background-color: white;
  display: flex;
  border: 1px solid #092230;
  border-radius: 12px;
  overflow: hidden;
  align-items: center;
}

.specific-units {
  display: inline-block;
}

.card {
  width: 600px;
  margin: 0 auto;
  padding: 10px;
  border: none !important;
}

@media (max-width: 850px) {
  .card {
    width: 100%;
  }
}

.calendar-title {
  margin: 5px;
  display: inline-block;
}


.calendar-popup {
  padding: 5px;
  width: 50px;
  cursor: pointer;
}

@media (max-width: 450px) {
  .nav-item {
    width: 150px;
  }
}

.nav-pills .mytab .nav-link:not(.active) {
  background-color: red !important;
}

.card-header {
  background-color: #1a4269 !important;
}

.nav-link {
  color: white !important;
}

.nav-link.active {
  color: #1a4269 !important;
}

.input-number {
  font-size: 20x;
  width: 50px;
  height: 35px;
  margin: 0px 5px 0px 5px;
  background-color: transparent;
  /* border: 2px solid #72767e; */
  border: none;
  color: #092230;
  font-weight: bold;
  text-align: center;
}

.button-minus-left {
  border-right: 1px solid #092230;
}

.button-plus-right {
  border-left: 1px solid #092230;
}

input[type="number"] {
  box-sizing: border-box;
}

.destination-selector-children {
  display: inline-block;
  margin: 5px;
  cursor: pointer;
}

.destination-selector {
  display: block;
  justify-content: center;
}


#marina-image {
  /* position: absolute; */
  /* top: 0px;
  left: 4px; */
  width: 100%;
  border-color: white;
  /* border-radius: 4px; */
  z-index: 1000;
  /* box-shadow: 0 0 10px rgba(0, 0, 0, 0.75); */
  cursor: pointer;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;

}

@media (max-width: 850px) {
  .marina-image {
    width: 95%;
  }
}


.marina-image-container {
  position: relative;
}


.general-selection-button {
  cursor: pointer;
  /* box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.75); */
  font-weight: bold;
  color: #092230;
  /* border: 1px solid #4FBCA2; */
}

.typeOfUserSelection {
  margin: 10px;
  font-size: 20px;
}

.general-button-container {
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid #092230;
  display: inline-flex;
  justify-content: center;
}

.typeOfUserButton {
  /* margin: 20px 0px; */
  padding: 5px 15px 5px 15px;
  /* border: 2px solid #FAFBFF; */
  width: 100px;
}

.activeUserTab {
  background: #092230;
  color: #092230;
}

.control-pane-tab {
  /* display: flex; */
  /* justify-content: center;
  align-items: center; */
}


.marina-layout-option {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.input-selector-specific-wl {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0px 20px;
}

@media (max-width: 850px) {
  .input-selector-specific-wl {
    justify-content: center;
  }

  /* .input-number {
    height: 25px;
    width: 35px;
    font-size: 18px;  
    margin: 0px 2px 0px 2px;
  } */
}


.input-selector-parent {
  display: block;
}

.input-selector {
  /* margin: 10px; */
}

.active-selection {
  /* padding: 0px 1px; */
  font-weight: bold;
  background-color: #092230;
  color: white;
  box-shadow: none;
}

/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}

.angle-button-container {
  cursor: pointer;
  color: #092230;
  font-weight: bold;
  padding: 0px 15px;
}

.selector-specific-text {
  margin: 5px 5px 1px 5px;
  color: #092230;
  font-size: 16px;
  font-weight: 700;
  line-height: 29px;
  text-align: center;

}

.destination-button {
  padding: 5px;
  width: 130px;
}



.location-selector-text {
  position: relative;
}

.calendar-input {
  background-color: #092230;
  color: white;
  font-size: 15px;
  text-align: center;
  border-radius: 12px;
}

.dot-and-text-container {
  margin: 5px;
  color: #092230
}

.greater-smaller-sign {
  text-align: center;
  font-weight: bold;
  margin: 0px 10px;
  font-size: 30px;
  cursor: pointer;
  padding-top: 5px;
}

.date-selector-and-buttons {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  width: 100%;
  align-items: center;
}

.day-info-container {
  line-height: 15px;
  font-size: 20px;
  margin: 3px;
  font-weight: 1000;

}

.date-selector {
  padding-bottom: 4px;
  ;
}
</style>