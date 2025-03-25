<template>
  <div id="app">
    <div class="app-header">
      <div class="app-title-container">
        <div class="marina-name">{{ $t("marina-name") }}</div>
        <div class="app-title">{{ $t("app-title") }}</div>
      </div>
      <TheLanguageButton></TheLanguageButton>
    </div>
    <div class="the-app-core">
      <div class="controlAndChart">
        <TheChartAndOptions :dataToDisplay="dataToDisplay" :range="range" class="the-results">
        </TheChartAndOptions>

        <TheControlPane @draught="updateData" @config="modifyData" @dateChanged="modifyDate" class="controlPanel">
        </TheControlPane>
      </div>
    </div>
    <!-- <div class="app-footer"></div> -->
  </div>
</template>

<script>
import TheControlPane from "./components/TheControlPane.vue";
import TheChartAndOptions from "./components/TheChartAndOptions.vue";
import TheLanguageButton from "@/components/TheLanguageButton.vue";
import axios from "axios";
import { conversionFunctions } from "@/common/units-utils";

export default {
  name: "App",
  components: {
    TheControlPane,
    TheChartAndOptions,
    TheLanguageButton,
  },

  data() {
    return {
      range: [],
      selectedDate: null,
      draught: null,
      destination: null,
      specificWaterLevel: null,
      waterLevelData: {},
      limitWaterLevel: 0,
      dataToDisplay: {},
      type: "visitor",
      changedRange: true,
    };
  },
  methods: {
    date2string(year, month, day, hour, minute) {
      return year + "-" + month + "-" + day + "T" + hour + ":" + minute + ":00Z";
    },
    getDateValuesFromDate(date) {
      var year = String(date.getUTCFullYear());
      var month = String(date.getUTCMonth() + 1).padStart(2, "0");
      var day = String(date.getUTCDate()).padStart(2, "0");
      var hour = String(date.getUTCHours()).padStart(2, "0");
      var minute = String(date.getUTCMinutes()).padStart(2, "0");
      return this.date2string(year, month, day, hour, minute);
    },
    apiCall: async function () {
      let codes = [
        ["wlp", "wlp"],
        ["wlp-hilo", "wlphilo"],
      ];
      let _this = this;
      for (let code of codes) {
        const result = await axios.get(
          "https://api.iwls.azure.cloud.dfo-mpo.gc.ca/api/v1/stations/5cebf1de3d0f4a073c4bbaf1/data?time-series-code=" +
          code[0] +
          "&from=" +
          _this.getDateValuesFromDate(_this.range[0]) +
          "&to=" +
          _this.getDateValuesFromDate(_this.range[1]) +
          ""
        );
        if (result.status === 200) {
          this.waterLevelData[code[1]] = result.data;
        }
      }
    },
    updateData: function (draught) {
      this.draught = draught;
      this.checkType();
      this.updateDataToDisplay()
    },
    modifyData: async function (config) {
      if (this.$store.state.selectedDate === config.selectedDate) {
        this.changedRange = false;
      } else {
        this.changedRange = true;
      }
      this.$store.mutations.updateSelectedDate(config.selectedDate);
      this.range = this.getRange(config.selectedDate);
      this.draught = config.draught;
      this.destination = config.destination;
      this.specificWaterLevel = config.specificWaterLevel;
      this.checkType();
      await this.downloadData();
      this.updateDataToDisplay()
    },
    modifyDate: async function (dateChange) {
      let selectedDate = new Date(this.$store.state.selectedDate);
      selectedDate.setDate(selectedDate.getDate() + dateChange);
      if (this.$store.state.selectedDate === selectedDate) {
        this.changedRange = false;
      } else {
        this.changedRange = true;
      }
      this.$store.mutations.updateSelectedDate(new Date(selectedDate));
      this.range = this.getRange(selectedDate);
      this.checkType();
      await this.downloadData();
      this.updateDataToDisplay()
    },
    // changeType: function (type) {
    //   this.type = type;
    //   this.checkType();
    // },
    checkType: function () {
      // if (this.type === "visitor") {
      this.limitWaterLevel = this.draught + this.destination;
      // } else {
      //   this.limitWaterLevel = this.specificWaterLevel;
      // }
    },

    downloadData: async function () {
      if (this.changedRange === true) {
        await this.apiCall();
        if (this.$store.state.units != "meter") {
          this.changeDataUnits(this.$store.state.units);
        }
      }
    },

    updateDataToDisplay: function () {

      this.$set(this.dataToDisplay, "waterLevel", this.limitWaterLevel);
      this.$set(this.dataToDisplay, "waterData", {});

      for (let code in this.waterLevelData) {
        this.$set(this.dataToDisplay["waterData"], code, this.waterLevelData[code]);
      }
    },

    getRange: function (selectedDate) {
      let startDate = new Date(selectedDate);
      startDate.setDate(startDate.getDate());
      startDate.setHours(0, 0, 0, 0);

      let endDate = new Date(selectedDate);
      endDate.setDate(endDate.getDate() + 1);
      endDate.setHours(0, 0, 0, 0);

      return [startDate, endDate];
    },
    changeDataUnits: function (units) {
      for (let code in this.waterLevelData) {
        for (let i = 0; i < this.waterLevelData[code].length; i++) {
          this.waterLevelData[code][i].value = conversionFunctions[units](
            this.waterLevelData[code][i].value
          );
        }
      }
    },
  },
  watch: {
    "$store.state.units": function (newValue) {
      this.changeDataUnits(newValue);
      this.$set(this.dataToDisplay, "waterLevel", this.limitWaterLevel);
      this.$set(this.dataToDisplay, "waterData", this.waterLevelData);
    },
  },
};
</script>

<style>

html,
body {
  margin: 0px;
  height: 100%;
}

#app {
  font-family: Inter, Arial, Avenir, Helvetica, sans-serif;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  /* background: transparent linear-gradient(179deg, #121c31 0%, #606775 100%) 0% 0%
    no-repeat padding-box; */
  background-color: #eef2f4;
  min-height: 100%;
  color: #092230;
  margin: 0 auto;
}

.app-header {
  background-color: #092230;
  /* height: 70px; */
  display: flex;
  justify-content: space-between;
  align-items: center;
  line-height: 170%;
}

.app-title-container {
  margin: 10px;
}

.app-title {
  font-weight: bold;
  font-size: 30px;
  text-align: left;
  color: white;
  /* margin: 0px 20px; */
}

.marina-name {
  font-size: 20px;
  text-align: left;
  color: white;
}

@media (max-width: 500px) {
  .app-title {
    font-size: 17px;
  }
}

.the-app-core {
  width: 100%;
  min-height: 500px;
  display: block;
}

.controlAndChart {
  display: flex;
  justify-content: center;
  max-width: 1500px;
  margin: auto;
}

@media (max-width: 850px) {
  .controlAndChart {
    flex-direction: column-reverse;
  }
}

.app-description {
  padding: 15px;
  color: white;
  max-width: 350px;
  text-align: left;
}

.svg-container {
  display: inline-block;
  position: relative;
  width: 98%;
  /* aspect ratio */
  /* height: 100%; */
  vertical-align: top;
  /* max-width: 700px; */
  margin: 4px;
}

.controlPanel {
  position: relative;
  /* padding: 15px 15px 5px 15px; */
  margin: 10px 30px 10px 10px;
  border-radius: 10px;
  border: 4px solid #4fbca2;
  box-shadow: 0px 4px 4px 0px #00000040;
  max-width: 320px;
  overflow: hidden;
  background-color: #D6E1E7;
}

@media (max-width: 850px) {
  .controlPanel {
    margin: 0px;
    border-radius: 0px;
    border: none;
    box-shadow: none;
    max-width: none;
    
  }
}

.general-settings {
  width: 500px;
  display: flex;
  justify-content: center;
}

.the-results {
  flex-grow: 1;
  display: block;
  max-width: 1000px;
  margin: 0 auto;
  /* background-color: white; */
}

@media (max-width: 1000px) {
  .the-results {
    display: block;
  }
}

@media (max-width: 850px) {
  .the-results {
    width: 100%;
  }
}

.app-footer {
  height: 30px;
  background-color: transparent;
}
</style>
