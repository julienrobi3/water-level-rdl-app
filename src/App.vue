<template>
  <div id="app">
    <TheLanguageButton></TheLanguageButton>
    <div class="controlAndChart">
      <TheControlPane
        @config="modifyData"
        @waterLevelType="changeType"
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
      draught: null,
      destination: null,
      specificWaterLevel: null,
      waterLevelData: null,
      limitWaterLevel: 0,
      dataToDisplay: {},
      type:0
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
      this.range = [config.range.start, config.range.end];
      this.draught = config.draught
      this.destination = config.destination
      this.specificWaterLevel = config.specificWaterLevel
      this.checkType()
    },
    changeType: function(type){
      this.type = type
      this.checkType()
    },
    checkType: function(){
      if (this.type === 0) {
        this.limitWaterLevel = this.draught + this.destination;
      } else {
        this.limitWaterLevel = this.specificWaterLevel
      }
      this.downloadData();
    },

    downloadData: async function () {
      await this.apiCall();
      this.$set(this.dataToDisplay, "waterLevel", this.limitWaterLevel);
      this.$set(this.dataToDisplay, "waterData", this.waterLevelData);
    },
  },
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
