<template>
  <div class="unit-selector">
    <div class="unit-selector-inner-container">
      <div @click="function () { displayUnitsSelected = 'meter' }" class="unit-selector-children general-selection-button"
      :class="displayUnitsSelected === 'meter' ? 'active-selection' : ''">M</div>
      <div @click="function () { displayUnitsSelected = 'foot' }" class="unit-selector-children general-selection-button"
        :class="displayUnitsSelected === 'foot' ? 'active-selection' : ''">Ft</div>
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
  /* margin: 0px 5px; */
  cursor: pointer;
  padding:6px;
  width:35px;
}
.unit-selector-inner-container{
  border-radius: 8px;
  overflow: hidden;
}
</style>