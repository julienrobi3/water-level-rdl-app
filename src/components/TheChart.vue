<template>
  <div>graph</div>
</template>

<script>
import * as d3 from "d3";
export default {
  props: ["dataToDisplay"],
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
      line,
      width: 1000,
      height: 450,
      margin: { top: 40, bottom: 20, left: 40, right: 40 },
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
      dateHovered: null,
      data: {},
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
      this.data = {};
      this.data = this.dataToDisplay["waterData"];
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

      // Set x axis
      this.x = d3
        .scaleTime()
        .range([this.margin.left, this.width - this.margin.right])
        .domain(this.extentX);

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
        .attr("viewBox", "0 0 1000 550");
    },
    fillChart: function () {
      if (this.svg === null) return;
      this.svg.append("g");
      //Display prediction lines
      this.svg
        .append("path")
        .data([this.data])
        .attr("class", "line")
        .attr("d", this.line)
        .style("stroke-width", 4)
        .style("stroke", "blue")
        .style("fill", "none");
    },
    updateChart: function () {
      this.clearContent();
      if (this.dataToDisplay.waterData.length === 0) return;
      this.initializeChart();
      if (this.svg === null) return;
      this.fillChart();
      //this.setAxis();
      //this.addInteractions();
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
</style>