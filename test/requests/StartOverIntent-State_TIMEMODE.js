const config = require('../test-config');

module.exports = {
  "session": {
    "sessionId": "",
    "application": {
      "applicationId": config.appId, //App ID
    },
    "attributes": {
      "speechOutput": "How long would you like the meeting to be?", // Last speech output
      "STATE": "_TIMEMODE", // State
      "repromptSpeech": "Please tell me how long you'd like the meeting to be. The maximum is 2 hours.", // Last reprompt speech
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
      "name": "AMAZON.StartOverIntent", // Name of Intent
      "slots": {},
    },
  },
  "version": "1.0",
};
