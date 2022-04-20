<template>
  <div>
    <div class="calendar-title">{{ $t("calendar-title") }}</div>
    <div class="dates-chosen-and-calendar">
      <span class="dates-chosen">{{ datesDisplayed }}</span>
      <img id="calendar-popup" :src="require('@/assets/calendar-icon.svg')" />
    </div>

    <b-popover
      target="calendar-popup"
      :title="$t('calendar')"
      triggers="hover focus"
    >
      <div class="date-selector">
        <v-date-picker v-model="range" is-range @input="handleInput()" />
      </div>
      <div>{{ $t("calendar-explanation") }}</div>
      <div class="warning-range" v-show="invalidRange">
        {{ $t("invalidRangeMessage") }}
      </div>
    </b-popover>
    <b-card no-body>
      <b-tabs v-model="tabIndex" small card>
        <b-tab :title="$t('unknown_waterlevel')" active>
          <b-card-text
            ><div class="draught-selector">
              <div class="draught-selector-children">
                {{ $t("draught") }}
              </div>
              <input
                class="draught-selector-children draught-selector-input"
                v-model.number="draught"
                type="number"
                v-on:input="emitConfig"
              />
              <UnitsSelector class="draught-selector-children"></UnitsSelector>
            </div>
            <div class="destination-selector">
              <div class="destination-selector-children">
                {{ $t("boat-choice") }}
              </div>
              <b-form-radio
                class="destination-selector-children"
                v-model="destinationSelected"
                :value="marinaValue"
                v-on:change="emitConfig"
                >Marina</b-form-radio
              >
              <b-form-radio
                class="destination-selector-children"
                v-model="destinationSelected"
                :value="visitorValue"
                v-on:change="emitConfig"
                >{{ $t("visitor-dock") }}</b-form-radio
              >
            </div></b-card-text
          >
        </b-tab>
        <b-tab :title="$t('specific_waterlevel')">
          <b-card-text class="specific-water-input-head"
            ><input
              class="draught-selector-input"
              v-model.number="specificWaterLevel"
              type="number"
              v-on:input="emitConfig"
          /></b-card-text>
          <UnitsSelector class="draught-selector-children"></UnitsSelector>
        </b-tab>
      </b-tabs>
    </b-card>
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
    tabIndex: function () {
      this.$emit("waterLevelType", this.tabIndex);
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
  background-color: #3182ce !important;
  color: white !important;
}
.draught-selector {
  margin: 3px;
}
.warning-range {
  color: #d86c00;
}

.specific-water-input-head {
  display: inline-block;
}
.specific-units {
  display: inline-block;
}
.card {
  width: 600px;
  margin: 0 auto;
  padding:10px;
  border:none !important;
}
.calendar-title {
  margin: 5px;
  display: inline-block;
}
.calendar-info-icon {
  width: 20px;
  display: inline-block;
}
#calendar-popup {
  padding: 15px;
  width: 60px;
  cursor: pointer;
}
@media (max-width: 450px) {
  .nav-item {
    width: 150px;
  }
  .card {
    width: 350px;
  }
}
.nav-pills .mytab .nav-link:not(.active) {
  background-color: red !important;
}

.card-header {
  background-color: #3182ce !important;
}
.nav-link {
  color: white !important;
}
.nav-link.active {
  color: #3182ce !important;
}
.draught-selector-children {
  display: inline-block;
}

.draught-selector-input {
  width: 50px;
  margin: 5px;
}
input[type="number"] {
  box-sizing: border-box;
  border: 2px solid #3182ce;
  border-radius: 13px;
}
.destination-selector-children {
  display: inline-block;
  margin: 5px;
}
</style>