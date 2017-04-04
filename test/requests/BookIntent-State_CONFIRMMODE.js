const config = require('../test-config');

module.exports = {
  "session": {
    "sessionId": "",
    "application": {
      "applicationId": config.appId,
    },
    "attributes": {
      "speechOutput": `${config.roomName} is available. Would you like me to book it?`, // Last speech output
      "STATE": "_CONFIRMMODE", // State
      "repromptSpeech": `Would you like me to book ${config.roomName} for you?`, // Last reprompt speech
      "startTime": config.startTime, // Start time of meeting
      "endTime": config.endTime, // End time of meeting
      "duration": config.duration, // Duration of meeting
      "ownerAddress": config.ownerAddress, // Email address of room
      "ownerName": config.ownerName, // Name of room owner
      "roomName": config.roomName, // Name of room calendar
    },
    "user": {
      "userId": "",
      "accessToken": config.token, // Microsoft Authentication Token
    },
    "new": false, // New session
  },
  "request": {
    "type": "IntentRequest", // Type of request
    "requestId": "",
    "locale": "en-GB", // Locale
    "timestamp": "",
    "intent": {
      "name": "BookIntent", // Name of Intent
      "slots": {},
    },
  },
  "version": "1.0",
};
