<template>
  <div>
    <div class="draught-selector">
      <div>{{ $t("draught") }} (m)</div>
      <input v-model.number="draught" type="number" />
    </div>
    <b-form-group class="destination-selector" :label="$t('boat-choice')">
      <b-form-radio v-model="destinationSelected" :value="marinaValue"
        >Marina</b-form-radio
      >
      <b-form-radio v-model="destinationSelected" :value="visitorValue">{{
        $t("visitor-dock")
      }}</b-form-radio>
    </b-form-group>
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
      invalidRange: false,
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
    let _this = this
    async function mount() {
      await _this.handleInput();
      _this.emitConfig();
    }
    mount()
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
  },
};
</script>

<style>
.destination-selector {
  border: 2px solid blue;
  padding: 10px;
  border-radius: 25px;
  width: 30%;
  margin: 0 auto;
}
.warning-range {
  color: #d86c00;
}
</style>