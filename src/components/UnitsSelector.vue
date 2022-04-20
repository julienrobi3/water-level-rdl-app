<template>
  <div class="unit-selector">
    <div>
      <b-form-radio
        class="unit-selector-children"
        v-model="displayUnitsSelected"
        value="meter"
        buttons
        >{{ $t("meters") }}</b-form-radio
      >
      <b-form-radio
        class="unit-selector-children"
        v-model="displayUnitsSelected"
        value="foot"
        buttons
        >{{ $t("feet") }}</b-form-radio
      >
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      displayUnitsSelected: this.$store.state.units,
    };
  },

  watch: {
    displayUnitsSelected: function (value) {
      this.$store.mutations.updateSelectedUnits(value);
    },
    "$store.state.units": function(value){
      this.displayUnitsSelected = value
    }
  },
};
</script>

<style>
.unit-selector {
  margin: 1px;
}
.unit-selector-children {
  display: inline-block;
  margin: 5px;
}
</style>