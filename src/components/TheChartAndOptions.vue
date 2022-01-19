<template>
  <div>
    <div class="viewChoice">
      <b-button variant="primary" @click="view = 'chart'">{{
        $t("chart")
      }}</b-button>
      <b-button variant="primary" @click="view = 'calendar'">{{
        $t("Calendrier")
      }}</b-button>
    </div>
    <div class="chartAndOptions" v-show="view === 'chart'">
      <TheChart
        @colorBoxChanged="loadColorBoxes"
        @draggedDate="setActiveDot"
        id="waterLevelChart"
        class="svg-container"
        :dataToDisplay="dataToDisplay"
        :range="range"
        :bus="bus"
      ></TheChart>
      <div
        v-for="index in daysArray.length"
        :key="index"
        class="dot"
        :class="{ active: activeIndex === index }"
        @click="logClick(index)"
      ></div>
    </div>

    <TheCalendarView
      v-show="view === 'calendar'"
      :colorBoxes="colorBoxes"
      :range="range"
    ></TheCalendarView>
  </div>
</template> 

<script>
import Vue from "vue";
import TheCalendarView from "@/components/TheCalendarView.vue";
import TheChart from "@/components/TheChart.vue";
export default {
  components: { TheCalendarView, TheChart },
  props: ["dataToDisplay", "range"],
  data() {
    return {
      view: "chart",
      colorBoxes: [],
      daysArray: [],
      startDisplayedDate: null,
      activeIndex: 1,
      bus: new Vue(),
    };
  },
  methods: {
    loadColorBoxes: function (colorBoxes) {
      this.colorBoxes = colorBoxes;
    },
    updateDots: function () {
      this.activeIndex = 1;
      let getDaysArray = function (start, end) {
        let arr = [];
        for (let dt = new Date(start); dt < end; dt.setDate(dt.getDate() + 1)) {
          arr.push(new Date(dt));
        }
        return arr;
      };
      this.daysArray = getDaysArray(this.range[0], this.range[1]);
    },
    logClick: function (index) {
      // A bus is created to emit an event to a child component.
      this.bus.$emit("dateClicked", this.daysArray[index - 1]);
      this.activeIndex = index;
    },
    setActiveDot: function (date) {
      let _this = this;
      let getClosestDate = function () {
        let closest = { date: null, diff: null };
        for (let i = 0; i < _this.daysArray.length; i++) {
          if (closest.date === null) {
            closest = {
              date: _this.daysArray[i],
              diff: Math.abs(_this.daysArray[i] - date),
            };
          } else if (Math.abs(_this.daysArray[i] - date) < closest.diff) {
            closest = {
              date: _this.daysArray[i],
              diff: Math.abs(_this.daysArray[i] - date),
            };
          }
        }
        return closest;
      };
      let closestDate = getClosestDate();
      for (let j = 0; j < this.daysArray.length; j++) {
        if (this.daysArray[j] === closestDate.date) {
          this.activeIndex = j + 1;
        }
      }
    },
  },
  watch: {
    range: function () {
      this.updateDots();
    },
  },
};
</script>

<style>
.chartAndOptions {
  border-radius: 10px;
  border: 2px solid blue;
}
.dot {
  height: 25px;
  width: 25px;
  background-color: #bbb;
  border-radius: 50%;
  display: inline-block;
  margin: 8px;
  cursor: pointer;
}
.dot:hover {
  height: 30px;
  width: 30px;
}
.dot.active {
  height: 30px;
  width: 30px;
  background-color: black;
}
</style>