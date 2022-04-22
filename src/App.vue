<template>
  <div id="app">
    <div class="app-header">
      <div class="app-title">{{ $t("app-title") }}</div>
      <TheLanguageButton></TheLanguageButton>
    </div>
    <div class="the-app-core">
      <div class="controlAndChart">
        <TheControlPane
          @config="modifyData"
          @waterLevelType="changeType"
          class="controlPanel"
        ></TheControlPane>
        <TheChartAndOptions
          :dataToDisplay="dataToDisplay"
          :range="range"
          class="theChart"
        ></TheChartAndOptions>
      </div>
      <div class="app-description">
        <div>{{ $t("app-description-intro") }}</div>
        <ul>
          <li>{{ $t("app-description-bullet-one") }}</li>
          <li>{{ $t("app-description-bullet-two") }}</li>
          <li>{{ $t("app-description-bullet-three") }}</li>
        </ul>
      </div>
    </div>
    <div class="app-footer"></div>
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
      draught: null,
      destination: null,
      specificWaterLevel: null,
      waterLevelData: null,
      limitWaterLevel: 0,
      dataToDisplay: {},
      type: 0,
      changedRange: true,
    };
  },
  methods: {
    date2string(year, month, day, hour, minute) {
      return (
        year + "-" + month + "-" + day + "T" + hour + ":" + minute + ":00Z"
      );
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
      let _this = this;
      const result = await axios.get(
        "https://api.iwls.azure.cloud.dfo-mpo.gc.ca/api/v1/stations/5cebf1de3d0f4a073c4bbaf1/data?time-series-code=wlp&from=" +
          _this.getDateValuesFromDate(_this.range[0]) +
          "&to=" +
          _this.getDateValuesFromDate(_this.range[1]) +
          ""
      );
      if (result.status === 200) {
        this.waterLevelData = result.data;
      }
    },
    modifyData: function (config) {
      if (
        this.range[0] === config.range.start &&
        this.range[1] === config.range.end
      ) {
        this.changedRange = false;
      } else {
        this.changedRange = true;
      }
      this.range = [config.range.start, config.range.end];
      this.draught = config.draught;
      this.destination = config.destination;
      this.specificWaterLevel = config.specificWaterLevel;
      this.checkType();
    },
    changeType: function (type) {
      this.type = type;
      this.checkType();
    },
    checkType: function () {
      if (this.type === 0) {
        this.limitWaterLevel = this.draught + this.destination;
      } else {
        this.limitWaterLevel = this.specificWaterLevel;
      }
      this.downloadData();
    },

    downloadData: async function () {
      if (this.changedRange === true) {
        await this.apiCall();
        if (this.$store.state.units != "meter") {
          this.changeDataUnits(this.$store.state.units);
        }
      }
      this.$set(this.dataToDisplay, "waterLevel", this.limitWaterLevel);
      this.$set(this.dataToDisplay, "waterData", this.waterLevelData);
    },
    changeDataUnits: function (units) {
      for (let i = 0; i < this.waterLevelData.length; i++) {
        this.waterLevelData[i].value = conversionFunctions[units](
          this.waterLevelData[i].value
        );
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
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  background-image: linear-gradient(#FFFFFF, #dddddd);
  min-height: 100%;
  color:#1a4269;
}
.app-header {
  height: 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.app-title {
  font-weight: bold;
  font-size: 20px;
  margin: 0px 20px;
}
@media (max-width: 500px) {
  .app-title {
    font-size: 13px;
  }
}
.the-app-core {
  width: 100%;
  min-height: 500px;
  display: inline-flex;
  flex-wrap: wrap;
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
  width: 98%; /* aspect ratio */
  height: 100%;
  vertical-align: top;
  max-width: 700px;
  margin: 4px;
}
.controlPanel {
  width: 600px;
  background-color: white;
  box-shadow: 0 0 5px rgb(0 0 0 / 40%);
  margin: 6px;
  border-radius: 10px;
}
@media (max-width: 600px) {
  .controlPanel {
    width: 100%;
  }
}
.general-settings {
  width: 500px;
  display: flex;
  justify-content: center;
}
.controlAndChart {
  display: inline-flex;
  flex-wrap: wrap;
  /* background-color: white; */
  justify-content: center;
}
.theChart {
  width: 550px;
  /* background-color: white; */
}
@media (max-width: 550px) {
  .theChart {
    width: 100%;
  }
}
.app-footer {
  height: 30px;
  background-color: transparent;
}
</style>
