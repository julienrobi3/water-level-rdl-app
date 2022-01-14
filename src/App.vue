<template>
  <div id="app">
    <TheLanguageButton></TheLanguageButton>
    <div class="controlAndChart">
      <TheControlPane
        @config="modifyData"
        class="controlPanel"
      ></TheControlPane>
      <TheChart
        :dataToDisplay="dataToDisplay"
        :range="range"
        class="theChart"
      ></TheChart>
    </div>
  </div>
</template>

<script>
import TheControlPane from "./components/TheControlPane.vue";
import TheChart from "./components/TheChart.vue";
import TheLanguageButton from "./components/TheLanguageButton.vue";
import axios from "axios";

export default {
  name: "App",
  components: {
    TheControlPane,
    TheChart,
    TheLanguageButton,
  },

  data() {
    return {
      range: [],
      waterLevelData: null,
      limitWaterLevel: 0,
      dataToDisplay: {},
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
    downloadData: async function (config) {
      let _this = this;
      const result = await axios.get(
        "https://api.iwls.azure.cloud.dfo-mpo.gc.ca/api/v1/stations/5cebf1de3d0f4a073c4bbaf1/data?time-series-code=wlp&from=" +
          _this.getDateValuesFromDate(config.range.start) +
          "&to=" +
          _this.getDateValuesFromDate(config.range.end) +
          ""
      );
      if (result.status === 200) {
        this.waterLevelData = result.data;
      }
    },

    modifyData: async function (config) {
      this.range = [config.range.start, config.range.end];
      this.limitWaterLevel = config.draught + config.destination;
      await this.downloadData(config);
      this.$set(this.dataToDisplay, "waterLevel", this.limitWaterLevel);
      this.$set(this.dataToDisplay, "waterData", this.waterLevelData);
    },
  },
  watch:{
    "range":function(){
      console.log(this.range)
    }
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.svg-container {
  display: inline-block;
  position: relative;
  width: 100%; /* aspect ratio */
  height: 100%;
  vertical-align: top;
  max-width: 700px;
  border-radius: 10px;
  border: 2px solid blue;
  margin: 4px;
}
.controlPanel {
  width: 500px;
}
.controlAndChart {
  display: flex;
  flex-wrap: wrap;
}
.theChart {
  width: 550px;
}
</style>
