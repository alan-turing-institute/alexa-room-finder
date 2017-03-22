var durationInMinutes = 30;
var startDateTime =  new Date();
var endDateTime = new Date(startDateTime.getTime() + durationInMinutes * 60000);

module.exports = {
  appId: "{same APP_ID as index.js}",
  token: "{token}",
  startTime: startDateTime.toISOString(),
  endTime: endDateTime.toISOString(),
  duration: durationInMinutes,
  ownerAddress: "{email address of room that's free}",
  //Usually the two strings below have the same value.
  ownerName: "{name of room owner that's free}",
  roomName: "{name of room calendar that's free}"
}
