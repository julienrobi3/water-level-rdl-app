<template>
  <div>
    
    <div class="calendar-section">
      <TheCalendarView :colorBoxes="colorBoxes" :range="range"></TheCalendarView>
    </div>
    <div class="chartAndOptions">
      <TheChart
        @colorBoxChanged="loadColorBoxes"
        id="waterLevelChart"
        class="svg-container"
        :dataToDisplay="dataToDisplay"
        :range="range"
        :bus="bus"
      ></TheChart>
    </div>
    <!-- <div class="separator"></div> -->
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
      isBackHovered: false,
      isNextHovered: false,
    };
  },
  computed: {
    // selectedDate: function(){
    // }
  },
  methods: {
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

    loadColorBoxes: function (colorBoxes) {
      this.colorBoxes = colorBoxes;
    },
    // updateDots: function () {
    //   this.activeIndex = 1;
    //   let getDaysArray = function (start, end) {
    //     let arr = [];
    //     for (let dt = new Date(start); dt < end; dt.setDate(dt.getDate() + 1)) {
    //       arr.push(new Date(dt));
    //     }
    //     return arr;
    //   };
    //   this.daysArray = getDaysArray(this.range[0], this.range[1]);
    // },
    logClick: function (index) {
      // A bus is created to emit an event to a child component.
      this.bus.$emit("dateClicked", this.daysArray[index - 1]);
      this.activeIndex = index;
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
      // this.updateDots();
    },
  },
};
</script>

<style>
.chartAndOptions {
  max-width: 800px;
  width: 95%;
  margin: 0 auto;
}

/* @media (max-width: 1000px) {
  .chartAndOptions {
    width: 100%;
    
  }
} */

.dot {
  height: 15px;
  width: 15px;
  background-color: white;
  border-radius: 50%;
  display: inline-block;
  margin: 8px 8px 2px 8px;
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

.dot-date {
  width: 50px;
  line-height: 90%;
  /* position:relative; */
}

.active-date {
  /* position:absolute; */
  /* top:30px; */
}

.active-date-line {
  margin: 5px 0 5px 0;
}

.back-next-arrows {
  margin: 8px 8px 2px 8px;
  width: 20px;
  height: 20px;
  cursor: pointer;
  border-radius: 50%;
  background-color: #bbbfc4;
}

.back-next-arrows:hover {
  background-color: #07234a;
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
  color: grey;
  font-weight: bold;
  margin: 20px 5px 20px 5px;
  max-width: 130px;
}

.calendar-section {
  max-width: 400px;
  margin: 15px auto;
  font-size: 20px;
}

/* .separator {
  width: 2px;
  background: white;
  margin-left:15px;
} */

@media (max-width: 1000px) {
  /* .separator {
    height: 2px;
    width: 75%;
    margin: 0 auto;
  } */

  .calendar-section {
    max-width: 400px;
  }
}

.color-circle {
  margin: 7px 3px 3px 3px;
  border-radius: 50%;
  background-color: #07234a;
  width: 22px;
  height: 22px;
}
</style>
