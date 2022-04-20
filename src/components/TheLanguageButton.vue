<template>
  <div class="language-button" @click="switchLocale()">
    <img class="logo" :src="require('@/assets/language-light.svg')" />
    <span class="switchText">{{ $i18n.locale === "fr" ? "EN" : "FR" }} </span>
  </div>
</template>

<script>
export default {
  methods: {
    switchLocale() {
      if (this.$i18n.locale === "fr") {
        this.$i18n.locale = "en";
      } else {
        this.$i18n.locale = "fr";
      }
    },
  },
};
</script>

<style>
.logo {
  height: 40px;
}
.language-button {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  cursor: pointer;
  width: 60px;
  margin:20px
}
</style>