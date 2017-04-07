const requesters = require('../../lambda/requesters');
const config = require('../test-config');

console.log('\n----- getCalendars ----- \n');

requesters.getCalendars(config.token)
.then((parsedCals) => {
  console.info('Successful request: \n');
  console.log(parsedCals);
  return parsedCals;
}, (calError) => {
  console.error('An error occurred in getCalendars: \n');
  console.log(calError);
});
