<template>
  <div class="unit-selector">
    <div class="unit-choice">
      <input type="radio" id="meter" value="meter" v-model="displayUnitsSelected" />
      <label for="meter" class="custom-radio">m</label>
    </div>
    <div class="unit-choice">
      <input type="radio" id="foot" value="foot" v-model="displayUnitsSelected" />
      <label for="foot" class="custom-radio">f</label>
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
      this.displayUnitsSelected = value;
    },
  },
};
</script>

<style>
.unit-selector {
  display: flex;
  align-items: flex-start;
  -webkit-flex-direction: column;
  flex-direction: column;
  margin-left: 8px;
  color: #16374a;
}

.unit-selector-children {
  display: inline-block;
  /* margin: 0px 5px; */
  cursor: pointer;
  padding: 6px;
  width: 35px;
}
.unit-selector-inner-container {
  border-radius: 8px;
  overflow: hidden;
}
.custom-radio{
  padding:0px 5px;
  height: 20px;
  line-height: 20px;
  text-align: center;
}

.unit-choice{
display:flex;
margin:3px;
}

input[type="radio"] {
  appearance: none;
  /* Customize the color and other styles */
  border: 1px solid #2c3e50; /* Set the border color */
  color: #fff; /* Set the text color */
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
}

/* Style the custom radio button when checked */
input[type="radio"]:checked {
  appearance: none;
  background-color: #2c3e50; /* Set the background color when checked */
  border: 1px solid #2c3e50; /* Set the border color when checked */
  border-radius: 10px;
  padding: 10px;
}
</style>
