<template>
  <div>
    <div class="chartAndOptions">
      <TheChart
        @colorBoxChanged="loadColorBoxes"
        @draggedDate="setActiveDot"
        id="waterLevelChart"
        class="svg-container"
        :dataToDisplay="dataToDisplay"
        :range="range"
        :bus="bus"
      ></TheChart>
      <div class="dot-wrapper" v-show="daysArray.length > 1">
        <div @click="dayMinusOne" :class="{ greyed: isBackGreyed }">
          <img
            class="back-next-arrows"
            @mouseover="mouseOverBack"
            @mouseleave="mouseLeaveBack"
            :src="
              isBackGreyed
                ? require('@/assets/back-button-greyed.svg')
                : isBackHovered
                ? require('@/assets/back-button-black-on-white.svg')
                : require('@/assets/back-button-white-on-black.svg')
            "
          />
        </div>

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
        <div @click="dayPlusOne" :class="{ greyed: isNextGreyed }">
          <img
            class="back-next-arrows"
            @mouseover="mouseOverNext"
            @mouseleave="mouseLeaveNext"
            :src="
              isNextGreyed
                ? require('@/assets/next-button-greyed.svg')
                : isNextHovered
                ? require('@/assets/next-button-black-on-white.svg')
                : require('@/assets/next-button-white-on-black.svg')
            "
          />
        </div>
      </div>
    </div>
    <div class="calendar-section">
      <div class="calendar-text">{{$t("calendar-view-title")}}</div>
      <TheCalendarView
        :colorBoxes="colorBoxes"
        :range="range"
      ></TheCalendarView>
    </div>
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
      isBackHovered: false,
      isNextHovered: false,
    };
  },
  computed: {
    isBackGreyed: function () {
      if (this.activeIndex === 1) {
        return true;
      } else {
        return false;
      }
    },
    isNextGreyed: function () {
      if (this.activeIndex === this.daysArray.length) {
        return true;
      } else {
        return false;
      }
    },
  },
  methods: {
    dayPlusOne: function () {
      this.activeIndex += 1;
      this.bus.$emit("dateClicked", this.daysArray[this.activeIndex - 1]);
    },
    dayMinusOne: function () {
      this.activeIndex -= 1;
      this.bus.$emit("dateClicked", this.daysArray[this.activeIndex - 1]);
    },
    mouseOverBack: function () {
      this.isBackHovered = true;
    },
    mouseLeaveBack: function () {
      this.isBackHovered = false;
    },
    mouseOverNext: function () {
      this.isNextHovered = true;
    },
    mouseLeaveNext: function () {
      this.isNextHovered = false;
    },
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
  background-color: #434a54;
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
.back-next-arrows {
  margin: 8px;
  width: 20px;
  height: 20px;
  cursor: pointer;
}
.greyed {
  cursor: auto;
  pointer-events: none;
}

@media (max-width: 450px) {
  .dot-date {
    width: 40px;
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
.calendar-text {
  color:grey;
  font-weight: bold;
  margin:20px 5px 20px 5px;
  max-width:130px;
}
.calendar-section{
display: flex;
}
</style>