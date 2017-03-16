
/**
 * @file Tests the lambda code, using the lambda-local package. To be run with node from the terminal.
 * You may need to install lambda-local, using 'npm install lambda-local'. If you do a global install (i.e. 'sudo npm install -g lambda-local') you can also test the lambda code using the console.
 *
 * NB: Config.js must first be edited to contain a token for this code to work. Otherwise it will return a JSON parsing error.
 */

const lambdaLocal = require('lambda-local');

const config = require('./config') //config.js contains the token.

//This is the JSON payload that would be sent when the user first agrees to book something, and an example of a normal IntentRequest.
var jsonPayload = {
  "session": {
    "sessionId": "",
    "application": {
      "applicationId": config.appId
    },
    "attributes": {
      "speechOutput": "Would you like to book a room for half an hour?", //Change this to change the *last* message used.
      "STATE": "", //Change this to change the current state. - Options: "_CONFIRMMODE" or "" (blank).
      "repromptSpeech": "I'm %s. My job is to book you a room! For further instructions, please ask for help." //Change this to change the *last* reprompt used.
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

//Main
lambdaLocal.execute({
    event: jsonPayload,
    lambdaPath: '../lambda/index.js',
    profileName: 'default',
    timeoutMs: 3000,
    callback: function(err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log(data);
        }
    }
});
