const config = require('../test-config');

module.exports = {
  "session": {
    "sessionId": "",
    "application": {
      "applicationId": config.appId, // App ID
    },
    "attributes": {
      "speechOutput": "Would you like to book a meeting room at the Turing?", // Last speech output
      "STATE": "", // Current state
      "repromptSpeech": "I'm Room Finder. My job is to book meeting rooms! If you need further instructions, just ask me for help.", //Last reprompt speech
    },
    "user": {
      "userId": "",
      "accessToken": config.token, // Microsoft Authentication Token
    },
    "new": false, // New session
  },
  "request": {
    "type": "IntentRequest", // Type of Request
    "requestId": "",
    "locale": "en-GB", // Locale
    "timestamp": "",
    "intent": {
      "name": "DurationIntent", // Name of Intent
      "slots": {
        "Duration": { // Duration Slot
          "name": "Duration",
          "value": config.duration,
        },
      },
    },
  },
  "version": "1.0",
};
