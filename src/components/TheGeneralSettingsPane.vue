<template>
  <div class="general-settings">
    <TheLanguageButton></TheLanguageButton>
    <TheUnitsSelector></TheUnitsSelector>
  </div>
</template>

<script>
import TheLanguageButton from "@/components/TheLanguageButton.vue";
import TheUnitsSelector from "@/components/TheUnitsSelector.vue";
export default {
  components: { TheLanguageButton, TheUnitsSelector },
};
</script>

<style>

</style>