<template>
  <div>
    <div class="draught-selector">
      <div>{{ $t("draught") }}</div>
      <input v-model.number="draught" type="number" />
    </div>
    <div class="date-selector">
      <v-date-picker v-model="range" is-range />
    </div>
    <b-button variant="primary" @click="emitConfig">{{
      $t("submit")
    }}</b-button>
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
    return {
      draught: null,
      range: {
        start: new Date(),
        end: new Date(),
      },
      trimmedRange: { start: null, end: null },
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
      config["range"] = this.trimmedRange
      this.$emit("config", config);
    },
    generateValidDates() {
      let startDate;
      let endDate;
      if (!this.validRange) {
        startDate = this.range.start;
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 5);
      } else {
        startDate = this.range.start;
        endDate = this.range.end;
      }
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(endDate.getDate() + 1);
      endDate.setHours(0, 0, 0, 0);

      this.trimmedRange = { start: startDate, end: endDate };


    },
  },
  watch: {
    range: function () {
      this.generateValidDates();
    },
  },
};
</script>

<style>
</style>