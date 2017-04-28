const requesters = require('../../lambda/requesters');
const config = require('../test-config');

console.log('\n----- findFreeRoom ----- \n');

requesters.getCalendars(config.token)
.then((parsedCals) => {
  requesters.findFreeRoom(
    config.token,
    config.startTime,
    config.endTime,
    [config.ownerName],
    parsedCals)
  .then((creds) => {
    console.info('Successful request: \n');
    console.log(creds);
  }, (roomError) => {
    console.error('An error occurred while getting rooms: \n');
    console.error(roomError);
  });
}, (calError) => {
  console.error('An error occurred while getting calendars in findFreeRoom: \n');
  console.error(calError);
});
