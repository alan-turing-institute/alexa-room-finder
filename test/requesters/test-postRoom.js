const requesters = require('../../lambda/requesters');
const config = require('../test-config');

console.log('\n----- postRoom -----\n');

requesters.postRoom(
  config.token,
  config.ownerAddress,
  config.ownerName,
  config.startTime,
  config.endTime)
.then(() => {
  console.info('Successful Request! Check that the room has accepted the invitation on Outlook.');
}, (postError) => {
  console.error('An error occurred while posting the room.');
  console.error(postError);
});
