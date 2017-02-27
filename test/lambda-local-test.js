/*Example test of index.js, using the lambda-local package.
If you have lambda-local installed globally a test can also be performed from the console.*/

const lambdaLocal = require('lambda-local');

/*This is the JSON payload that would be sent when the user first agrees to book something, and an example of a normal IntentRequest.*/
var jsonPayload = {
  "session": {
    "sessionId": "SessionId.18b70cec-0b2b-4c42-aad7-297d969d1181",
    "application": {
      "applicationId": "amzn1.ask.skill.9ed5a39f-9d07-4e65-91ce-d16d59cbca0c"
    },
    "attributes": {
      "speechOutput": "Room 1.4 is available. Would you like me to book it for you?", //Change this to change the *last* message used.
      "STATE": "_CONFIRMMODE", //Change this to change the current state. - Options: "_CONFIRMMODE" or "" (blank).
      "repromptSpeech": "Would you like me to book room 1.4 for you?" //Change this to change the *last* reprompt used.
    },
    "user": {
      "userId": "amzn1.ask.account.AHPUQELLZCI6N3U2VS3EDVPT5MX3EGG45B4M2JRZWZ2PEBONRFSJEPEUIZG32CMP6GQGYDLA7UGMW65IHXJVXU24BEIQGQYVJ7IQAH7EZRYNB3RQPEG6225TYVH2KT63OV4EWQ4UKF5HJHCQEHO2K3YTWO3V5PSOAUF4BU4SSFRNBDQV4ULW6UFKJIL7WF22UI54V4SQY6DZHJI"
    },
    "new": false
  },
  "request": {
    "type": "IntentRequest", //Change this to change type of request. Options: "IntentRequest" or "LaunchRequest"
    "requestId": "EdwRequestId.2b1b1613-9454-45e5-9dcd-7c000305a640",
    "locale": "en-US", //Change this to change language. Options: "en-US" or "en-GB"
    "timestamp": "2017-02-27T14:10:12Z",
    "intent": {
      "name": "BookIntent", //Change this to change the intent sent with the request. Options: "AMAZON.NoIntent", "AMAZON.YesIntent", "AMAZON.CancelIntent", "AMAZON.StopIntent", "AMAZON.RepeatIntent", "AMAZON.HelpIntent", "BookIntent", "Unhandled"
      "slots": {}
    }
  },
  "version": "1.0"
}

//Main
lambdaLocal.execute({
    event: jsonPayload,
    lambdaPath: 'index.js',
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
