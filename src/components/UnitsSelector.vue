<template>
  <div class="unit-selector">
    <div>
      <div @click="function () { displayUnitsSelected = 'meter' }" class="unit-selector-children"
      :class="displayUnitsSelected === 'meter' ? 'active-selection' : ''">{{ $t("meters") }}</div>
      <div @click="function () { displayUnitsSelected = 'foot' }" class="unit-selector-children"
        :class="displayUnitsSelected === 'foot' ? 'active-selection' : ''">{{ $t("feet") }}</div>
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
    "$store.state.units": function (value) {
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
  margin: 0px 5px;
  cursor: pointer;
}
</style>