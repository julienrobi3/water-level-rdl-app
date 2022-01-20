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
      <div class="dot-wrapper">
        <div
          v-for="index in daysArray.length"
          :key="index"
          @click="logClick(index)"
          class="dot-date"
        >
          <div class="dot" :class="{ active: activeIndex === index }"></div>
          <div v-show="activeIndex === index">
            <div>{{ getDay(daysArray[index - 1]) }}</div>
            <div>{{ getDate(daysArray[index - 1]) }}</div>
          </div>
        </div>
      </div>
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
import { days, months } from "@/common/time-utils";
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
    getDay: function (date) {
      return days[this.$i18n.locale][date.getDay()];
    },
    getDate: function (date) {
      let month = months[this.$i18n.locale][date.getMonth()];
      let day = date.getDate();
      return day + " " + month;
    },
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
    range: function (newValue, oldValue) {
      if (oldValue.length === 0) {
        return;
      }
      if (
        newValue[0].getTime() === oldValue[0].getTime() &&
        newValue[1].getTime() === oldValue[1].getTime()
      ) {
        return;
      }
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
  height: 15px;
  width: 15px;
  background-color: #bbb;
  border-radius: 50%;
  display: inline-block;
  margin: 8px;
  cursor: pointer;
}
.dot:hover {
  height: 20px;
  width: 20px;
}
.dot.active {
  height: 20px;
  width: 20px;
  background-color: black;
}
.dot-wrapper {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  width: 100%;
}
.dot-date {
  width: 50px;
  line-height: 90%;
}

@media (max-width: 450px) {
  .dot-date {
    width: 45px;
    font-size: small;
  }
  .dot:hover {
    height: 15px;
    width: 15px;
  }
  .dot.active {
    height: 15px;
    width: 15px;
  }
}
</style>