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
    <div
      v-show="view === 'chart'"
      id="waterLevelChart"
      class="svg-container"
    ></div>
    <TheCalendarView
      v-show="view === 'calendar'"
      :colorBoxes="colorBoxes"
      :range="range"
    ></TheCalendarView>
  </div>
</template>

<script>
import * as d3 from "d3";
import TheCalendarView from "@/components/TheCalendarView.vue";
export default {
  components: { TheCalendarView },
  props: ["dataToDisplay", "range"],
  data() {
    var _this = this;
    var line = d3
      .line()
      .x(function (d) {
        return _this.x(d.date);
      })
      .y(function (d) {
        return _this.y(d.value);
      });
    return {
      view: "chart",
      line,
      rect: null,
      width: 1000,
      height: 450,
      margin: { top: 40, bottom: 20, left: 85, right: 40 },
      content: null,
      dates: null,
      minYValue: null,
      maxYValue: null,
      extentX: null,
      svg: null,
      x: null,
      y: null,
      xAxis: null,
      lineFollowX: null,
      mouseMoveX: null,
      selectedData: {},
      dragStart: null,
      dateHovered: null,
      dateMinDisplayed: null,
      dateMaxDisplayed: null,
      limitNbOfHours: 24,
      data: [],
      lastIntersectIndex: 0,
      index: 0,
      predictionLine: null,
      intersectionPoints: [],
      allIntersectIndices: [0],
      colorBoxes: [],
    };
  },
  methods: {
    splitDateTime: function (string) {
      let DateTimeSplit = string.eventDate.split("T");
      let DateSplit = DateTimeSplit[0].split("-");
      let TimeSplit = DateTimeSplit[1].slice(0, -1).split(":");
      return DateSplit + TimeSplit;
    },
    clearContent: function () {
      let _this = this;
      this.content = document.getElementById("waterLevelChart");

      // Clear the content
      var child = _this.content.lastElementChild;
      while (child) {
        _this.content.removeChild(child);
        child = _this.content.lastElementChild;
      }
    },
    initializeChart: function () {
      let _this = this;
      this.data = [];
      this.data = [...this.dataToDisplay["waterData"]];
      this.data.sort(function (a, b) {
        var aSplit = _this.splitDateTime(a);
        var bSplit = _this.splitDateTime(b);
        return aSplit > bSplit ? 1 : aSplit < bSplit ? -1 : 0;
      });
      for (let i = 0; i < this.data.length; i++) {
        this.data[i].date = new Date(this.data[i].eventDate);
      }

      this.dates = this.data.map((a) => a.date);

      // get min and max values for chart
      this.maxYValue = null;
      this.minYValue = null;

      var min = d3.min(this.data, (d) => d.value);
      if (this.minYValue === null || min < this.minYValue) {
        this.minYValue = min;
      }
      var max = d3.max(this.data, (d) => d.value);
      if (this.maxYValue === null || max > this.maxYValue) {
        this.maxYValue = max;
      }

      // Max extent of the data
      this.extentX = d3.extent(this.data, (d) => d.date);
      this.dateMinDisplayed = new Date(this.extentX[0]);

      this.dateMaxDisplayed = new Date();
      this.dateMaxDisplayed.setHours(
        this.dateMinDisplayed.getHours() + this.limitNbOfHours
      );

      // Set x axis
      this.x = d3
        .scaleTime()
        .range([this.margin.left, this.width - this.margin.right]);
      //.domain(this.extentX);
      this.setXDomain();

      // Set y axis
      this.y = d3
        .scaleLinear()
        .domain([this.minYValue, this.maxYValue])
        // .domain(d3.extent(this.baseData, (d) => d.value))
        .range([this.height - this.margin.bottom, this.margin.top]);

      this.svg = d3
        .select(this.content)
        .append("svg")
        .attr("class", "svg-content-responsive")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 1000 600");
    },
    addPredictionLine() {
      this.svg.append("g");
      //Display prediction lines
      this.predictionLine = this.svg
        .append("path")
        .data([this.data])
        .attr("class", "line")
        .attr("d", this.line)
        .style("stroke-width", 4)
        .style("stroke", "black")
        .style("fill", "none");
    },
    computeColorBoxesAndIntersections() {
      this.intersectionPoints = [];
      this.colorBoxes = [];
      this.allIntersectIndices = [0];
      var yLine = this.y(this.dataToDisplay.waterLevel);
      var node = this.predictionLine.node();
      var pathLength = node.getTotalLength();

      this.lastIntersectIndex = 0;
      for (var i = 0; i < pathLength; i++) {
        var point = node.getPointAtLength(i);
        if (Math.floor(point.y) === Math.floor(yLine)) {
          this.findIndexRelated(point.x);
          if (
            !this.allIntersectIndices.includes(this.index) &&
            this.index -
              this.allIntersectIndices[this.allIntersectIndices.length - 1] >
              1
          ) {
            this.allIntersectIndices.push(this.index);
            this.intersectionPoints.push({
              x: this.dates[this.index],
              y: point.y,
            });
            let startIndex = this.lastIntersectIndex;
            let endIndex = this.index;
            this.constructColorBox(startIndex, endIndex);
            this.lastIntersectIndex = this.index;
          }
        }
      }
      // create last rectangle
      let startIndex = this.lastIntersectIndex;
      let endIndex = this.dates.length - 1;
      this.constructColorBox(startIndex, endIndex);
    },
    constructColorBox(startIndex, endIndex) {
      const average = (array) => array.reduce((a, b) => a + b) / array.length;
      let values = this.data.slice(startIndex, endIndex).map((a) => a.value);

      let color = null;
      if (values.length != 0) {
        if (average(values) > this.dataToDisplay.waterLevel) {
          color = "green";
        } else {
          color = "red";
        }
        this.colorBoxes.push({
          startIndex: startIndex,
          endIndex: endIndex,
          startDate: this.dates[startIndex],
          endDate: this.dates[endIndex],
          color: color,
        });
      }
    },
    fillChart: function () {
      //Add vertical line and threshold
      this.svg
        .append("line")
        .attr("stroke", "#F00")
        .attr("x1", this.margin.left)
        .attr("y1", this.y(this.dataToDisplay.waterLevel))
        .attr("x2", this.width)
        .attr("y2", this.y(this.dataToDisplay.waterLevel))
        .attr("class", "line")
        .style("stroke", "black");

      // Add Intersection points
      for (let i = 0; i < this.intersectionPoints.length; i++) {
        this.svg
          .append("circle")
          .attr("class", "circle")
          .attr("cx", this.x(this.intersectionPoints[i].x))
          .attr("cy", this.intersectionPoints[i].y)
          .attr("r", 5)
          .style("fill", "black");

        let hours = this.intersectionPoints[i].x.getHours().toString()
        let minutes = this.intersectionPoints[i].x.getMinutes().toString()
        minutes = ('0'+minutes).slice(-2)
        this.svg
          .append("text")
          .style("opacity", 1)
          .style("fill", "black")
          .style("font-size", "25px")
          .attr("class", "levelValuesOnChart")
          .attr("x", this.x(this.intersectionPoints[i].x) + 10)
          .attr("y", (this.intersectionPoints[i].y) - 5)
          .attr("text-anchor", "right")
          .text(hours+":"+minutes);
      }
      for (let i = 0; i < this.colorBoxes.length; i++) {
        d3.select("g")
          .append("rect")
          .attr("class", "rect")
          .attr("x", this.x(this.dates[this.colorBoxes[i].startIndex]))
          .attr(
            "width",
            this.x(this.dates[this.colorBoxes[i].endIndex]) -
              this.x(this.dates[this.colorBoxes[i].startIndex])
          )
          .attr("height", this.height - this.margin.bottom)
          .style("opacity", 0.3)
          .attr("fill", this.colorBoxes[i].color);
      }
    },
    findIndexRelated: function (xValue) {
      var x0 = this.x.invert(xValue);
      this.index = d3.bisect(this.dates, x0);
    },
    findDataRelated(event, target) {
      var pointer = d3.pointer(event, target);
      this.findIndexRelated(pointer[0]);
      this.selectedData = this.data[this.index];
    },

    addInteractions: function () {
      // Create a rect on top of the svg area: this rectangle recovers the position
      this.rect = this.svg
        .append("rect")
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr("class", "chartRect");
      // Création de l'intéraction drag
      this.rect.call(
        d3
          .drag()
          .on("start", this.dragStarted)
          .on("drag", this.dragged)
          .on("end", this.dragEnded)
      );
    },
    dragStarted: function () {
      if (event.type === "mousedown") {
        this.findDataRelated(event, this.rect);
      }
      if (event.type === "touchstart") {
        this.findDataRelated(event.touches[0], event.target);
      }
      this.dragStart = this.selectedData;
    },
    dragged: function () {
      // Selon le type d'appareil (ordinateur ou mobile), l'event est différent
      if (event.type === "mousemove") {
        this.findDataRelated(event, this.rect);
      }
      if (event.type === "touchmove") {
        this.findDataRelated(event.touches[0], event.target);
      }

      var diff =
        this.dragStart.date.getTime() - this.selectedData.date.getTime();

      this.dateMinDisplayed.setTime(this.dateMinDisplayed.getTime() + diff);
      this.dateMaxDisplayed.setTime(this.dateMaxDisplayed.getTime() + diff);

      this.setXDomain();

      this.svg
        .select(".xaxis")
        .call(this.xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)")
        .style("font-size", 25);

      this.svg.selectAll(".line").remove();
      this.svg.selectAll(".rect").remove();
      this.svg.selectAll(".circle").remove();
      this.svg.selectAll(".levelValuesOnChart").remove();
      
      this.addPredictionLine();
      this.fillChart();
    },

    setAxis: function () {
      //configure xaxis
      const xAxisPosition = this.height - this.margin.bottom;
      const format = d3.timeFormat("%m-%d %Hh");
      this.xAxis = d3.axisBottom(this.x).ticks(10).tickFormat(format);
      this.svg
        .append("g")
        .attr("class", "xaxis")
        .attr("transform", "translate(0," + xAxisPosition + ")")
        .call(this.xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)")
        .style("font-size", 25)
        .style("stroke", "black")
        .selectAll("line")
        .style("stroke", "black")
        .selectAll("path")
        .style("stroke", "black");

      //Configure yaxis
      this.svg
        .append("g")
        .attr("class", "yaxis")
        .attr("transform", "translate(" + this.margin.left + ",0)")
        .call(d3.axisLeft(this.y).ticks(6))
        .style("font-size", 20)
        .style("stroke", "black");

      d3.selectAll(".xaxis line").style("stroke", "black");
      d3.selectAll(".yaxis line").style("stroke", "black");

      this.addYAxisLabel();
    },
    addYAxisLabel: function () {
      // text label for the y axis
      this.svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", this.margin.left - 90)
        .attr("x", 0 - this.height / 2)
        .attr("dy", "1em")
        .attr("id", "yLabel")
        .style("text-anchor", "middle")
        .text(this.$t("chartYLabel"))
        .style("font-size", 30);
    },
    setXDomain: function () {
      var dateVariable;
      if (this.dateMinDisplayed <= this.extentX[0]) {
        dateVariable = new Date(this.extentX[0]);
        this.dateMinDisplayed = new Date(this.extentX[0]);
        this.dateMaxDisplayed = new Date(
          dateVariable.setHours(dateVariable.getHours() + this.limitNbOfHours)
        );
        this.x.domain([this.dateMinDisplayed, this.dateMaxDisplayed]);
        //dateMaxDisplayed.setHours(dateMinDisplayed.getHours() + this.limitNbOfHours * 2)
      } else if (
        this.dateMinDisplayed > this.extentX[0] &&
        this.dateMaxDisplayed < this.extentX[1]
      ) {
        this.x.domain([this.dateMinDisplayed, this.dateMaxDisplayed]);
      } else if (this.dateMaxDisplayed >= this.extentX[1]) {
        dateVariable = new Date(this.extentX[1]);
        this.dateMaxDisplayed = new Date(this.extentX[1]);
        this.dateMinDisplayed = new Date(
          dateVariable.setHours(dateVariable.getHours() - this.limitNbOfHours)
        );
        this.x.domain([this.dateMinDisplayed, this.dateMaxDisplayed]);
      }
    },
    updateChart: function () {
      this.clearContent();
      if (this.dataToDisplay.waterData.length === 0) return;
      this.initializeChart();
      if (this.svg === null) return;
      this.addPredictionLine();
      this.computeColorBoxesAndIntersections();
      this.fillChart();
      this.setAxis();
      this.addInteractions();
    },
  },
  watch: {
    "dataToDisplay.waterData": function () {
      this.updateChart();
    },
  },
};
</script>

<style>
.chartRect {
  display: block;
  position: absolute;
  width: 100%;
  height: 100%;
  cursor: grab;
}

.chartRect:active {
  cursor: grabbing;
}
</style>