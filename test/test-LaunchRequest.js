const config = require('./config')

module.exports = {
  "session": {
    "sessionId": "",
    "application": {
      "applicationId": config.appId
    },
    "attributes": {},
    "user": {
      "userId": "",
      "accessToken": config.token //Change this to change token
    },
    "new": true //Change this to change if it's a new session or not.
  },
  "request": {
    "type": "LaunchRequest", //Change this to change type of request. Options: "IntentRequest" or "LaunchRequest"
    "requestId": "",
    "locale": "en-GB", //Change this to change language. Options: "en-US" or "en-GB"
    "timestamp": ""
  },
  "version": "1.0"
}
