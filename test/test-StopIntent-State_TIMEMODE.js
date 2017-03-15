const config = require('./config')

module.exports = {
  "session": {
    "sessionId": "",
    "application": {
      "applicationId": ""
    },
    "attributes": {
      "speechOutput": "How long would you like to book the room for?", //Change this to change the *last* message used.
      "STATE": "_TIMEMODE", //Change this to change the current state. - Options: "_CONFIRMMODE" or "" (blank).
      "repromptSpeech": "Please tell me how long you'd like the room for. The maximum is 2 hours." //Change this to change the *last* reprompt used.
    },
    "user": {
      "userId": "",
      "accessToken": config.token //Change this to change token
    },
    "new": false //Change this to change if it's a new session or not.
  },
  "request": {
    "type": "IntentRequest", //Change this to change type of request. Options: "IntentRequest" or "LaunchRequest"
    "requestId": "",
    "locale": "en-GB", //Change this to change language. Options: "en-US" or "en-GB"
    "timestamp": "",
    "intent": {
      "name": "AMAZON.StopIntent", //Change this to change the intent sent with the request. Options: "AMAZON.NoIntent", "AMAZON.YesIntent", "AMAZON.CancelIntent", "AMAZON.StopIntent", "AMAZON.RepeatIntent", "AMAZON.HelpIntent", "BookIntent", "Unhandled"
      "slots": {} //Change this to put something in slots
    }
  },
  "version": "1.0"
}
