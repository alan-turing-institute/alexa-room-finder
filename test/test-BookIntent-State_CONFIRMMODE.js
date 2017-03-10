const config = require('./config')

module.exports = {
  "session": {
    "sessionId": "",
    "application": {
      "applicationId": ""
    },
    "attributes": {
      "speechOutput": "Would you like to book a room for half an hour?", //Change this to change the *last* message used.
      "STATE": "_CONFIRMMODE", //Change this to change the current state. - Options: "_CONFIRMMODE" or "" (blank).
      "repromptSpeech": "I'm %s. My job is to book you a room! For further instructions, please ask for help.", //Change this to change the *last* reprompt used.
      "startTime": config.startTime,
		  "endTime": config.endTime,
	    "roomOwner": config.owner,
	    "roomName": config.roomName
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
      "name": "BookIntent", //Change this to change the intent sent with the request. Options: "AMAZON.NoIntent", "AMAZON.YesIntent", "AMAZON.CancelIntent", "AMAZON.StopIntent", "AMAZON.RepeatIntent", "AMAZON.HelpIntent", "BookIntent", "Unhandled"
      "slots": {} //Change this to put something in slots
    }
  },
  "version": "1.0"
}
