function formatDateToDisplay(date, weekDays) {
  var dayOfWeek = weekDays[date.getDay()];

  let month = "" + (date.getMonth() + 1);
  let day = "" + date.getDate();
  let year = date.getFullYear();
  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;
  var dateString = [year, month, day].join("-");

  return [dayOfWeek, dateString].join(" ");
}
function formatTimeToDisplay(date) {
  var hour = date.getHours();
  var minutes = date.getMinutes();
  if (minutes < 10) {
    minutes = "0" + String(minutes);
  }
  return [hour, minutes].join(":");

}

export { formatDateToDisplay, formatTimeToDisplay };
