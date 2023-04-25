<template>
  <div></div>
</template>

<script>
import { unitsShort } from "@/common/units-utils";
import { fr_FR, en_EN } from "@/common/time-utils";
import * as d3 from "d3";
import { type } from "os";
export default {
  props: ["dataToDisplay", "range", "bus"],
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
      fontFamily: "Noto-Sans-JP, Avenir, Helvetica, Arial, sans-serif",
      localeChosen: null,
      view: "chart",
      startDisplayedDate: null,
      line,
      rect: null,
      width: 1000,
      height: 450,
      margin: { top: 60, bottom: 40, left: 20, right: 110 },
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
      filteredData: [],
      lastIntersectIndex: 0,
      index: 0,
      predictionLine: null,
      intersectionPoints: [],
      allIntersectIndices: [0],
      colorBoxes: [],
    };
  },
  computed: {
    unitString: function () {
      return unitsShort[this.$store.state.units][this.$i18n.locale]
    }
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
      if (this.localeChosen != null) {
        d3.timeFormatDefaultLocale(this.localeChosen);
      }

      this.data = [];
      this.data = [...this.dataToDisplay["waterData"]["wlp"]];
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
      //.domain(this.extentX);
      this.setXDomain();
      this.x.range([this.margin.left, this.width - this.margin.right]);

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
        .attr("viewBox", "0 0 1000 500");

      let defs = this.svg.append("defs")

      var svgGradientAboveThreshold = defs.append("linearGradient")
        .attr("id", "svgGradientAboveThreshold")
        .attr("x1", "0%")
        .attr("x2", "100%")
        .attr("y1", "0%")
        .attr("y2", "100%");

      svgGradientAboveThreshold.append("stop")
        .attr("class", "start")
        .attr("offset", "0%")
        .attr("stop-color", "#002b45")
        .attr("stop-opacity", 1);

      svgGradientAboveThreshold.append("stop")
        .attr("class", "end")
        .attr("offset", "100%")
        .attr("stop-color", "#00416a")
        .attr("stop-opacity", 1);

      var svgGradientBelowThreshold = defs.append("linearGradient")
        .attr("id", "svgGradientBelowThreshold")
        .attr("x1", "0%")
        .attr("x2", "100%")
        .attr("y1", "0%")
        .attr("y2", "100%");

      svgGradientBelowThreshold.append("stop")
        .attr("class", "start")
        .attr("offset", "0%")
        .attr("stop-color", "#842818")
        .attr("stop-opacity", 1);

      svgGradientBelowThreshold.append("stop")
        .attr("class", "end")
        .attr("offset", "100%")
        .attr("stop-color", "#ce3d26")
        .attr("stop-opacity", 1);
    },
    addPredictionLine() {
      this.svg.append("g");
      //Create the entire prediction line, for computational purposes only
      this.predictionLine = this.svg
        .append("path")
        .data([this.data])
        .attr("class", "line upfrontItem")
        .attr("d", this.line)
        .style("stroke-width", 0)
        .style("fill", "none");

      // add the prediction line to display
      this.svg
        .append("path")
        .data([this.filteredData])
        .attr("class", "line upfrontItem")
        .attr("d", this.line)
        .style("stroke-width", 4)
        .style("stroke", "white")
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

            //check if intersect from min to max or max to min
            let diff = node.getPointAtLength(i - 1).y - point.y
            let intersectType = null
            if (diff < 0) {
              intersectType = "maxToMin"
            }
            else { intersectType = "minToMax" }

            // check if intersects are too close with eachother (2.75h). If so, dont inlude them.
            if (this.intersectionPoints.length > 0 &&
              this.index - this.intersectionPoints[this.intersectionPoints.length - 1].index < 11) {
              this.intersectionPoints.pop()
            }
            else {
              this.intersectionPoints.push({
                index: this.index,
                x: this.dates[this.index],
                y: point.y,
                intersectType: intersectType
              });

            }
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
      let completeValues = this.data.slice(startIndex, endIndex + 1)

      completeValues.splice(0, 0, { date: this.data[startIndex]["date"], value: this.dataToDisplay.waterLevel })
      completeValues.push({ date: this.data[endIndex]["date"], value: this.dataToDisplay.waterLevel })
      let color = null;
      let navType = null;
      if (completeValues.length != 0) {
        if (average(completeValues.map((a) => a.value)) > this.dataToDisplay.waterLevel) {
          color = "url(#svgGradientAboveThreshold)";
          navType = "good"
        } else {
          // below line
          color = "url(#svgGradientBelowThreshold)";
          navType = "bad"
        }
        this.colorBoxes.push({
          type: navType,
          startIndex: startIndex,
          endIndex: endIndex,
          startDate: this.dates[startIndex],
          endDate: this.dates[endIndex],
          color: color,
          values: completeValues
        });
      }
      this.$emit("colorBoxChanged", this.colorBoxes);
    },
    fillChart: function () {
      let _this = this
      //Add vertical line and threshold
      this.svg
        .append("line")
        .attr("x1", this.margin.left)
        .attr("y1", this.y(this.dataToDisplay.waterLevel))
        .attr("x2", this.width - this.margin.right + 20)
        .attr("y2", this.y(this.dataToDisplay.waterLevel))
        .attr("class", "line upfrontItem")
        .style("stroke", "#58d9fd")
        .style("stroke-width", 6);

      // Styling à la Sophia
      this.svg
        .append("line")
        .attr("x1", this.width - this.margin.right + 24)
        .attr("y1", this.y(this.dataToDisplay.waterLevel))
        .attr("x2", this.width - this.margin.right + 30)
        .attr("y2", this.y(this.dataToDisplay.waterLevel))
        .attr("class", "line upfrontItem")
        .style("stroke", "#58d9fd")
        .style("stroke-width", 6);

      // Styling à la Sophia
      this.svg
        .append("line")
        .attr("x1", this.width - this.margin.right + 34)
        .attr("y1", this.y(this.dataToDisplay.waterLevel))
        .attr("x2", this.width - this.margin.right + 40)
        .attr("y2", this.y(this.dataToDisplay.waterLevel))
        .attr("class", "line upfrontItem")
        .style("stroke", "#58d9fd")
        .style("stroke-width", 6);

      // Styling à la Sophia
      this.svg
        .append("line")
        .attr("x1", this.width - this.margin.right + 44)
        .attr("y1", this.y(this.dataToDisplay.waterLevel))
        .attr("x2", this.width - this.margin.right + 50)
        .attr("y2", this.y(this.dataToDisplay.waterLevel))
        .attr("class", "line upfrontItem")
        .style("stroke", "#58d9fd")
        .style("stroke-width", 6);

      this.svg
        .append("text")
        .style("opacity", 1)
        .style("fill", "#58d9fd")
        .style("font-size", "22px")
        .style("font-weight", "bold")
        .style("font-family", this.fontFamily)
        .attr("class", "levelValuesOnChart upfrontItem")
        // .attr("x", this.x(point.x) + 4)
        .attr("x", this.width - this.margin.right + 60)
        .attr("y", this.y(this.dataToDisplay.waterLevel) + 6)
        // .attr("text-anchor", "right")
        .text(Math.round(this.dataToDisplay.waterLevel * 10) / 10 + this.unitString);

      // Add mins and maxs points
      let tideData = this.dataToDisplay["waterData"]["wlphilo"].filter(function (d) {
        return new Date(d.eventDate) >= _this.dateMinDisplayed && new Date(d.eventDate) <= _this.dateMaxDisplayed;
      })
      for (let i = 0; i < tideData.length; i++) {
        let tideState = null
        if (i === 0) {
          let diff = tideData[i + 1]["value"] - tideData[i]["value"]
          tideState = diff > 0 ? "low" : "high";
        }
        else {
          let diff = tideData[i - 1]["value"] - tideData[i]["value"]
          tideState = diff > 0 ? "low" : "high";
        }
        let date = new Date(tideData[i]["eventDate"])
        this.svg
          .append("circle")
          .attr("class", "circle")
          .attr("cx", this.x(date))
          .attr("cy", this.y(tideData[i]["value"]))
          .attr("r", 10)
          .style("fill", "white");

        let hours = date.getHours().toString();
        let minutes = date.getMinutes().toString();
        minutes = ("0" + minutes).slice(-2);
        this.svg
          .append("text")
          .style("opacity", 1)
          .style("fill", "white")
          .style("font-family", this.fontFamily)
          .style("font-size", "22px")
          .attr("class", "levelValuesOnChart upfrontItem")
          .attr("x", this.x(date))
          .attr("y", function () {
            if (tideState === "high") { return _this.y(tideData[i]["value"]) - 35 }
            else { return _this.y(tideData[i]["value"]) + 29 }
          })
          .attr("text-anchor", "middle")
          .text(hours + ":" + minutes);

        this.svg
          .append("text")
          .style("opacity", 1)
          .style("fill", "white")
          .style("font-size", "20px")
          .style("font-family", this.fontFamily)
          .attr("class", "levelValuesOnChart upfrontItem")
          .attr("x", this.x(date))
          //.attr("y", this.y(tideData[i]["value"]) - 15)
          .attr("y", function () {
            if (tideState === "high") { return _this.y(tideData[i]["value"]) - 15 }
            else { return _this.y(tideData[i]["value"]) + 50 }
          })
          .attr("text-anchor", "middle")
          .text(Math.round(tideData[i]["value"] * 10) / 10 + this.unitString);
      }

      // Add intersection points
      for (let point of this.intersectionPoints.filter(function (d) {
        return d.x >= _this.dateMinDisplayed && d.x <= _this.dateMaxDisplayed;
      })) {

        this.svg
          .append("circle")
          .attr("class", "circle")
          .attr("cx", _this.x(point.x))
          .attr("cy", point.y)
          .attr("r", 7)
          .style("fill", "#b1cfca");

        let hours = point.x.getHours().toString();
        let minutes = point.x.getMinutes().toString();
        minutes = ("0" + minutes).slice(-2);
        this.svg
          .append("text")
          .style("opacity", 1)
          .style("fill", "#b1cfca")
          .style("font-size", "23px")
          .style("font-family", this.fontFamily)
          .attr("class", "levelValuesOnChart upfrontItem")
          // .attr("x", this.x(point.x) + 4)
          .attr("x", function () {
            if (point.intersectType === "minToMax") { return _this.x(point.x) + 15 }
            else { return _this.x(point.x) + 4 }
          })
          .attr("y", point.y - 5)
          .attr("text-anchor", "right")
          .text(hours + ":" + minutes);

      }

      // for display, split colorboxes to only what we will see
      let filteredColorBoxes = []

      for (let i = 0; i < this.colorBoxes.length; i++) {
        if (this.dateMinDisplayed >= this.colorBoxes[i].startDate && this.dateMaxDisplayed <= this.colorBoxes[i].endDate) {
          // // // S'il y a seulement une voite à afficher:
          filteredColorBoxes.push({ color: this.colorBoxes[i].color, values: [] })
          // première boite, il faut la spliter au bon endroit
          let filteredValues = this.colorBoxes[i].values.filter(function (d) {
            return d.date >= _this.dateMinDisplayed && d.date <= _this.dateMaxDisplayed;
          })
          let whole_data = [{ date: this.dateMinDisplayed, value: this.dataToDisplay.waterLevel }].concat(filteredValues)
          whole_data.push({ date: this.dateMaxDisplayed, value: this.dataToDisplay.waterLevel })
          filteredColorBoxes.push({ color: this.colorBoxes[i].color, values: whole_data })

        }
        else if (this.dateMinDisplayed >= this.colorBoxes[i].startDate && this.dateMinDisplayed <= this.colorBoxes[i].endDate) {
          filteredColorBoxes.push({ color: this.colorBoxes[i].color, values: [] })
          // première boite, il faut la spliter au bon endroit
          let filteredValues = this.colorBoxes[i].values.filter(function (d) {
            return d.date >= _this.dateMinDisplayed && d.date <= _this.dateMaxDisplayed;
          })
          let whole_data = [{ date: this.dateMinDisplayed, value: this.dataToDisplay.waterLevel }].concat(filteredValues)
          filteredColorBoxes.push({ color: this.colorBoxes[i].color, values: whole_data })

        }
        else if (this.dateMinDisplayed <= this.colorBoxes[i].startDate && this.dateMaxDisplayed >= this.colorBoxes[i].endDate) {
          // toute le contenu de la boite doit être utilisé
          filteredColorBoxes.push({ color: this.colorBoxes[i].color, values: this.colorBoxes[i].values })
        }
        else if (this.dateMaxDisplayed >= this.colorBoxes[i].startDate && this.dateMaxDisplayed <= this.colorBoxes[i].endDate) {
          // dernière boite
          let filteredValues = this.colorBoxes[i].values.filter(function (d) {
            return d.date >= _this.dateMinDisplayed && d.date <= _this.dateMaxDisplayed;
          })
          filteredValues.push({ date: this.dateMaxDisplayed, value: this.dataToDisplay.waterLevel })
          filteredColorBoxes.push({ color: this.colorBoxes[i].color, values: filteredValues })
        }
      }
      for (let i = 0; i < filteredColorBoxes.length; i++) {
        this.svg
          .append("path")
          .data([filteredColorBoxes[i].values])
          .attr("class", "line")
          .attr("d", this.line)
          .style("stroke-width", 4)
          .style("stroke", filteredColorBoxes[i].color)
          .style("fill", filteredColorBoxes[i].color);

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
      this.$emit("draggedDate", this.dateMinDisplayed);
      // this.initializeChart();
      // this.fillChart();
      this.resetChart();
    },
    resetChart: function () {

      this.setXDomain();

      // this.svg
      //   // .select(".xaxis")
      //   // .call(this.xAxis)
      //   .selectAll("text")
      //   .style("font-size", 20)
      //   .style("stroke", "#52a7f7")
      //   .selectAll("line")
      //   .style("stroke", "#52a7f7")
      //   .selectAll("path")
      //   .style("stroke", "#52a7f7");

      this.svg.selectAll(".line").remove();
      this.svg.selectAll(".rect").remove();
      this.svg.selectAll(".circle").remove();
      this.svg.selectAll(".levelValuesOnChart").remove();

      this.addPredictionLine();
      this.fillChart();
      this.svg.selectAll(".upfrontItem").raise()
      this.svg.selectAll(".circle").raise()
      this.svg.selectAll(".chartRect").raise()

    },
    setXDomain: function () {
      var dateVariable;
      if (this.dateMinDisplayed <= this.extentX[0]) {
        dateVariable = new Date(this.extentX[0]);
        this.dateMinDisplayed = new Date(this.extentX[0]);
        this.dateMaxDisplayed = new Date(
          dateVariable.setHours(dateVariable.getHours() + this.limitNbOfHours)
        );
        this.filterData()
        this.x.domain([this.dateMinDisplayed, this.dateMaxDisplayed]);
        //dateMaxDisplayed.setHours(dateMinDisplayed.getHours() + this.limitNbOfHours * 2)
      } else if (
        this.dateMinDisplayed > this.extentX[0] &&
        this.dateMaxDisplayed < this.extentX[1]
      ) {
        this.filterData()
        this.x.domain([this.dateMinDisplayed, this.dateMaxDisplayed]);
      } else if (this.dateMaxDisplayed >= this.extentX[1]) {
        dateVariable = new Date(this.extentX[1]);
        this.dateMaxDisplayed = new Date(this.extentX[1]);
        this.dateMinDisplayed = new Date(
          dateVariable.setHours(dateVariable.getHours() - this.limitNbOfHours)
        );
        this.filterData()
        this.x.domain([this.dateMinDisplayed, this.dateMaxDisplayed]);
      }
    },
    filterData() {
      let _this = this
      this.filteredData = this.data.filter(function (d) {
        return d.date >= _this.dateMinDisplayed && d.date <= _this.dateMaxDisplayed;
      })

    },

    updateChart: function () {
      this.clearContent();
      if (this.dataToDisplay.waterData["wlp"].length === 0) return;
      this.initializeChart();
      if (this.svg === null) return;
      this.addPredictionLine();
      this.computeColorBoxesAndIntersections();
      this.fillChart();
      this.svg.selectAll(".upfrontItem").raise()
      this.svg.selectAll(".circle").raise()
      this.svg.selectAll(".chartRect").raise()
      this.addInteractions();



    },
    changeStartDate: function () {
      let _this = this;
      //let nbOfMilliSeconds = 86400000;
      let diff =
        this.startDisplayedDate.getTime() - this.dateMinDisplayed.getTime();

      let nbRep = 20;
      if (Math.abs(diff) > 250000000) {
        nbRep = 50;
      }

      let round = 0;
      function transitionChart() {
        modifyChart();
        round++;
        if (round < nbRep) {
          setTimeout(transitionChart, 15);
        }
      }
      transitionChart();

      function modifyChart() {
        _this.dateMinDisplayed.setTime(
          _this.dateMinDisplayed.getTime() + diff / nbRep
        );
        _this.dateMaxDisplayed.setTime(
          _this.dateMaxDisplayed.getTime() + diff / nbRep
        );

        _this.resetChart();
      }
    },
  },
  mounted() {
    this.bus.$on("dateClicked", (date) => {
      this.startDisplayedDate = date;
      this.changeStartDate();
    });
  },
  watch: {
    "dataToDisplay.waterData.wlphilo": function () {
      this.updateChart();
    },
    "dataToDisplay.waterLevel": function () {
      this.updateChart();
    },
    "$i18n.locale": function () {
      if (this.$i18n.locale === "fr") {
        this.localeChosen = fr_FR;
      } else {
        this.localeChosen = en_EN;
      }
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