<template>
  <div>
    <div class="typeOfUserSelection">
      <div class="typeOfUserButton" @click="activeTab = 'member'" :class="activeTab === 'member' ? 'activeUserTab' : ''">
        {{
          $t("member") }}</div>
      <div class="typeOfUserButton" @click="activeTab = 'visitor'"
        :class="activeTab === 'visitor' ? 'activeUserTab' : ''">{{
          $t("visitor") }}</div>
    </div>


    <div class="control-pane-tab" v-show="activeTab === 'member'">
      <div class="dates-chosen-and-calendar">
        <img id="calendar-popup-member" class="calendar-popup" :src="require('@/assets/calendar-icon.svg')" />
      </div>
      <b-popover target="calendar-popup-member" :title="$t('calendar')" triggers="hover focus">
        <div class="date-selector">
          <v-date-picker v-model="range" is-range @input="handleInput()" />
        </div>
        <div>{{ $t("calendar-explanation") }}</div>
        <div class="warning-range" v-show="invalidRange">
          {{ $t("invalidRangeMessage") }}
        </div>
      </b-popover>
      <div class="input-selector">
        <div class="input-selector-specific-wl-text">{{ $t("specific-water-level") }}</div>
        <div class="input-selector-specific-wl">
          <input class="draught-selector-input" v-model.number="specificWaterLevel" type="number"
            v-on:input="emitConfig" />
          <UnitsSelector class="draught-selector-children"></UnitsSelector>
        </div>
      </div>


    </div>

    <div class="control-pane-tab" v-show="activeTab === 'visitor'">
      <div class="dates-chosen-and-calendar">
        <img id="calendar-popup-visitor" class="calendar-popup" :src="require('@/assets/calendar-icon.svg')" />
      </div>
      <b-popover target="calendar-popup-visitor" :title="$t('calendar')" triggers="hover focus">
        <div class="date-selector">
          <v-date-picker v-model="range" is-range @input="handleInput()" />
        </div>
        <div>{{ $t("calendar-explanation") }}</div>
        <div class="warning-range" v-show="invalidRange">
          {{ $t("invalidRangeMessage") }}
        </div>
      </b-popover>
      <div class="draught-selector">
        <div class="draught-selector-children">
          <div>
            {{ $t("draught") }}
          </div>
          <input class="draught-selector-input" v-model.number="draught" type="number" v-on:input="emitConfig" />
        </div>
        <UnitsSelector class="draught-selector-children"></UnitsSelector>
      </div>
      <div class="destination-selector">
        <div> <b-form-radio class="destination-selector-children" v-model="destinationSelected" :value="marinaValue"
            v-on:change="emitConfig">Marina</b-form-radio>
          <b-form-radio class="destination-selector-children" v-model="destinationSelected" :value="visitorValue"
            v-on:change="emitConfig">{{ $t("visitor-dock") }}</b-form-radio>
        </div>
        <div class="marina-layout-option" @click="extandMarina = !extandMarina">
          <div>{{ $t("marina-layout") }}</div>
          <img id="marina-image-small" :src="require('@/assets/marina_rdl.png')" />
        </div>
      </div>
      <img id="marina-image" :src="require('@/assets/marina_rdl.png')" v-if="extandMarina" @click="extandMarina = false"/>
    </div>



  </div>
</template>

<script>
import { conversionFunctions } from "@/common/units-utils";
import { days } from "@/common/time-utils";
import {
  formatDateToDisplay,
  formatTimeToDisplay,
} from "@/common/timeRelatedFunctions";
import UnitsSelector from "@/components/UnitsSelector.vue";
export default {
  components: { UnitsSelector },
  computed: {
    datesDisplayed() {
      let start = formatDateToDisplay(
        this.range.start,
        days[this.$i18n.locale]
      );
      let end = formatDateToDisplay(this.range.end, days[this.$i18n.locale]);
      if (start === end) {
        return start;
      }
      return `${start} - ${end}`;
    },
    validRange() {
      if (this.calculateDiffDays(this.range.start, this.range.end) > 6) {
        return false;
      }
      return true;
    },
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

    return {
      extandMarina:false,
      activeTab: "member",
      tabIndex: 0,
      invalidRange: false,
      specificWaterLevel: 2,
      draught: 0,
      range: {
        start: new Date(),
        end: new Date(),
      },
      trimmedRange: { start: null, end: null },
      marinaValues,
      visitorValues,
      destinationSelected: marinaValues[this.$store.state.units],
    };
  },
  methods: {
    calculateDiffDays: function (first, second) {
      const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
      return Math.round(Math.abs((first - second) / oneDay));
    },
    emitConfig: function () {
      let config = {};
      config["draught"] = this.draught;
      config["range"] = this.trimmedRange;
      config["destination"] = parseFloat(this.destinationSelected);
      config["specificWaterLevel"] = this.specificWaterLevel;
      this.$emit("config", config);
    },

    handleInput() {
      this.$nextTick(() => {
        let endDate;
        if (!this.validRange) {
          endDate = new Date();
          endDate.setMonth(this.range.start.getMonth());
          endDate.setDate(this.range.start.getDate() + 5);
          this.range = {
            start: this.range.start,
            end: new Date(endDate),
          };
          this.invalidRange = true;
        } else {
          this.range = {
            start: this.range.start,
            end: this.range.end,
          };
          endDate = new Date(this.range.end);
          this.invalidRange = false;
        }

        this.range.start.setHours(0, 0, 0, 0);
        endDate.setDate(endDate.getDate() + 1);
        endDate.setHours(0, 0, 0, 0);

        this.trimmedRange = { start: this.range.start, end: endDate };
      });
    },
  },
  mounted() {
    let _this = this;
    async function mount() {
      await _this.handleInput();
    }
    mount();
  },
  watch: {
    trimmedRange: function () {
      this.emitConfig();
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
  margin: 10px 20px 10px 20px;
}

.warning-range {
  color: #d86c00;
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

@media (max-width: 600px) {
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

.draught-selector-children {
  display: flex;
  align-items: center;
  justify-content: center;

}

.draught-selector-input {
  width: 40px;
  height: 30px;
  margin: 5px;
  background-color: transparent;
  border: 2px solid #FAFBFF;
  color: white;
  text-align: center;
}

input[type="number"] {
  box-sizing: border-box;
  border-radius: 8px;
}

.destination-selector-children {
  display: inline-block;
  margin: 5px;
}

.destination-selector {
  display: block;
  justify-content: center;
}

#marina-image {
  position:absolute;
  top: 200px;
  max-width: 95%;
  border-color: white;
  border-radius: 4px;
  z-index: 1000;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.75);
  cursor: pointer;
}

#marina-image-small {
  max-width: 40px;
  border: 1px solid #FAFBFF;
  border-radius: 4px;
  margin: 3px;
}

.typeOfUserSelection {
  display: flex;
  justify-content: center;
}

.typeOfUserButton {
  margin: 20px;
  padding: 5px 15px 5px 15px;
  border: 2px solid #FAFBFF;
  border-radius: 8px;
  color: white;
  cursor: pointer;
}

.activeUserTab {
  background-color: #003D64;
}

.control-pane-tab {
  display: flex;
  justify-content: center;
  align-items: center;
}

@media (max-width: 500px) {
  .control-pane-tab {
    font-size: 13px;
  }
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
  cursor: pointer;
  margin: 0px 20px;
}

.input-selector-parent {
  display: block;
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
}</style>