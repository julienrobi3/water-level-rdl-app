<template>
  <div>
    <div>
      <!-- <div v-for="day in days" :key="day.title">
        <div class="calendar-day">
          <div class="calendar-day-title">{{ day.title }}</div>
          <div v-for="tide in day.data" :key="tide">{{ tide }}</div>
        </div>
      </div> -->
      <div class="timetable-title">{{ $t("navigational-timetable") }}</div>
      <div>
        {{ getDay($store.state.selectedDate) }} {{ getDate($store.state.selectedDate) }}
      </div>
      <div class="calendar-days">
        <span v-for="(time, index) in days" :key="index">
          {{ time }}
          <span v-if="index < days.length - 1" style="font-weight: 1000">
            &nbsp; / &nbsp;
          </span>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { days } from "@/common/time-utils";
import { formatDateToDisplay, formatTimeToDisplay } from "@/common/timeRelatedFunctions";
import { daysLong, months } from "@/common/time-utils";
export default {
  props: ["colorBoxes", "range"],
  computed: {
    days() {
      if (this.$store.state.selectedDate === null) {
        return null;
      }
      let dayList = this.getDates(new Date(this.range[0]), new Date(this.range[1]));
      let dayData = [];

      //get the title (or day) of the box
      for (let day of dayList) {
        dayData.push({
          title: formatDateToDisplay(day, days[this.$i18n.locale]),
          data: [],
        });
      }

      // get the data of the box
      for (let i = 0; i < this.colorBoxes.length; i++) {
        let onTwoDays = false;
        if (this.colorBoxes[i].type === "good") {
          let dayStartForm = formatDateToDisplay(
            this.colorBoxes[i].startDate,
            days[this.$i18n.locale]
          );
          let dayEndForm = formatDateToDisplay(
            this.colorBoxes[i].endDate,
            days[this.$i18n.locale]
          );
          let tideRangeString;
          if (dayStartForm === dayEndForm) {
            tideRangeString = `${formatTimeToDisplay(
              this.colorBoxes[i].startDate
            )} - ${formatTimeToDisplay(this.colorBoxes[i].endDate)}`;
          } else {
            onTwoDays = true;
            tideRangeString = `${formatTimeToDisplay(
              this.colorBoxes[i].startDate
            )} - 23:59`;
          }
          let index = dayData.findIndex((e) => e.title === dayStartForm);
          if (dayData[index] != undefined) {
            if (dayStartForm === dayData[index].title) {
              dayData[index].data.push(tideRangeString);
            }
          }
          if (onTwoDays) {
            tideRangeString = `00:00 - ${formatTimeToDisplay(
              this.colorBoxes[i].endDate
            )}`;
            if (tideRangeString != "00:00 - 0:00") {
              index = dayData.findIndex((e) => e.title === dayEndForm);
              if (dayData[index] != undefined) {
                if (dayEndForm === dayData[index].title) {
                  dayData[index].data.push(tideRangeString);
                }
              }
            }
          }
        }
      }

      // Only show the date chosen
      for (let index in dayData) {
        if (
          formatDateToDisplay(this.$store.state.selectedDate, days[this.$i18n.locale]) ===
          dayData[index].title
        ) {
          return dayData[index].data;
        }
      }
      return null;
    },
  },
  methods: {
    getDay: function (date) {
      return daysLong[this.$i18n.locale][date.getDay()];
    },
    getDate: function (date) {
      let month = months[this.$i18n.locale][date.getMonth()];
      let day = date.getDate();
      return day + " " + month;
    },
    getDates(startDate, stopDate) {
      var dateArray = [];
      var currentDate = startDate;
      while (currentDate < stopDate) {
        dateArray.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return dateArray;
    },
  },
};
</script>

<style>
.calendar-days {
  display: flex;
  flex-wrap: wrap;
  /* margin: 10px; */
  justify-content: center;
}

@media (max-width: 1000px) {
  .calendar-days {
    justify-content: center;
  }
}

.calendar-day {
  padding: 5px;
  margin: 10px 5px 10px 5px;
  color: #bfb8ab;
  font-size: 14px;
  width: 120px;
}

.calendar-day-title {
  font-weight: bold;
  color: white;
}
.timetable-title {
  font-weight: bold;
}
</style>
