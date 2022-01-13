<template>
  <div>
    <div class="draught-selector">
      <div>{{ $t("draught") }} (m)</div>
      <input v-model.number="draught" type="number" />
    </div>
    <b-form-group
      class="destination-selector"
      label="Emplacement de l'embarcation"
    >
      <b-form-radio v-model="destinationSelected" :value="marinaValue"
        >Marina</b-form-radio
      >
      <b-form-radio v-model="destinationSelected" :value="visitorValue"
        >Quai visiteur</b-form-radio
      >
    </b-form-group>
    <div class="date-selector">
      <v-date-picker v-model="range" is-range />
    </div>
    <b-button variant="outline-primary" @click="emitConfig">{{
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
    let visitorValue = 1.1;
    let marinaValue = 2.1;
    return {
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
    generateValidDates(start, end) {
      let startDate;
      let endDate;
      if (!this.validRange) {
        startDate = start;
        endDate = new Date(end);
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
  mounted(){
    this.generateValidDates(new Date(), new Date());
  },
  watch: {
    range: function () {
      this.generateValidDates(this.range.start,this.range.end);
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
</style>