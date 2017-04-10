const config = require('../test-config');

module.exports = {
  "session": {
    "sessionId": "",
    "application": {
      "applicationId": config.appId, // App ID
    },
    "attributes": {
      "STATE": "",
    },
    "user": {
      "userId": "",
      "accessToken": config.token, // Microsoft Authentication Token
    },
    "new": true, // New Session
  },
  "request": {
    "type": "LaunchRequest", // Type of Request
    "requestId": "",
    "locale": "en-GB", // Locale
  },
  "version": "1.0",
};
