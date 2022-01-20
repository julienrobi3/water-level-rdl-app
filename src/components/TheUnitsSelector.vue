<template>
  <div>
    <b-card-text>
      <b-form-group class="units-radio-selector" :label="$t('units')">
        <b-form-radio v-model="unitsSelected" value="meter">{{
          $t("meters")
        }}</b-form-radio>
        <b-form-radio v-model="unitsSelected" value="foot">{{
          $t("feet")
        }}</b-form-radio>
      </b-form-group></b-card-text
    >
  </div>
</template>

<script>
export default {
  data() {
    return { unitsSelected: this.$store.state.units };
  },

  watch: {
    unitsSelected: function (value) {
      this.$store.mutations.updateSelectedUnits(value);
    },
  },
};
</script>

<style>
</style>