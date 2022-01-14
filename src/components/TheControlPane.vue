<template>
  <div>
    <b-card no-body>
      <b-tabs v-model="tabIndex" small card>
        <b-tab :title="$t('unknown_waterlevel')" active>
          <b-card-text
            ><div class="draught-selector">
              <div>{{ $t("draught") }} (m)</div>
              <input v-model.number="draught" type="number" />
            </div>
            <b-form-group
              class="destination-selector"
              :label="$t('boat-choice')"
            >
              <b-form-radio v-model="destinationSelected" :value="marinaValue"
                >Marina</b-form-radio
              >
              <b-form-radio
                v-model="destinationSelected"
                :value="visitorValue"
                >{{ $t("visitor-dock") }}</b-form-radio
              >
            </b-form-group></b-card-text
          >
        </b-tab>
        <b-tab :title="$t('specific_waterlevel')">
          <b-card-text class="specific-water-input-head"
            ><input
              class="specific-water-input"
              v-model.number="specificWaterLevel"
              type="number"
          /></b-card-text>
          <div class="specific-units">m</div>
        </b-tab>
      </b-tabs>
    </b-card>
    <div class="date-selector">
      <v-date-picker v-model="range" is-range @input="handleInput()" />
    </div>
    <div class="warning-range" v-show="invalidRange">
      {{ $t("invalidRangeMessage") }}
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    validRange() {
      if (this.calculateDiffDays(this.range.start, this.range.end) > 6) {
        return false;
      }
      return true;
    },
  },
  data() {
    let visitorValue = 1.1;
    let marinaValue = 2.1;
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
      marinaValue,
      visitorValue,
      destinationSelected: marinaValue,
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
    draught: function () {
      this.emitConfig();
    },
    trimmedRange: function () {
      this.emitConfig();
    },
    destinationSelected: function () {
      this.emitConfig();
    },
    specificWaterLevel: function () {
      this.emitConfig();
    },
    tabIndex: function () {
      this.$emit("waterLevelType", this.tabIndex);
    },
  },
};
</script>

<style>
.destination-selector {
  border: 2px solid blue;
  padding: 10px;
  border-radius: 25px;
  width: 70%;
  margin: 0 auto;
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
.specific-water-input {
  width: 50px;
  margin: 2px;
}
.specific-units {
  display: inline-block;
}
.card {
  width: 450px;
  margin: 0 auto;
}
@media (max-width: 450px) {
  .nav-item {
    width: 150px;
  }
  .card {
    width: 350px;
  }
}
</style>