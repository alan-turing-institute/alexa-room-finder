var startDateTime =  new Date();
var endDateTime = new Date(startDateTime.getTime() + 30 * 60000);

module.exports = {
  token "{token}",
  startTime: startDateTime.toISOString(),
  endTime: endDateTime.toISOString(),
  owner: "{email address of room that's free}",
  roomName: "{name of the room that's free}"
}
