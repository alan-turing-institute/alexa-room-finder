const durationInMinutes = 30;
const startDateTime = new Date();
const endDateTime = new Date(startDateTime.getTime() + (durationInMinutes * 60000));

module.exports = {
  appId: "{same appId as lambda/config.js}",
  token: "{token}",
  startTime: startDateTime.toISOString(),
  endTime: endDateTime.toISOString(),
  duration: durationInMinutes,
  ownerAddress: "{email address of room that's free}",
  // Usually the two strings below have the same value.
  ownerName: "{name of room owner that's free}",
  roomName: "{name of room calendar that's free}",
};
