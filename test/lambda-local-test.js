/*Example test of index.js, using the lambda-local package.
If you have LambdaLocal installed globally a test can also be performed from the console.*/

const lambdaLocal = require('lambda-local');

/*This is the JSON payload that would be sent when the user first agrees to book something.*/
var jsonPayload = {
  "session": {
    "sessionId": "SessionId.23d62ab6-6883-4175-9368-cb9afbb713cd",
    "application": {
      "applicationId": "amzn1.ask.skill.9ed5a39f-9d07-4e65-91ce-d16d59cbca0c"
    },
    "attributes": {
      "speechOutput": "WELCOME_MESSAGE", //Change this to change the *last* message used..
      "STATE": "_STARTMODE", //Change this to change the current state. - Options: "_STARTMODE" or "_BOOKMODE"
      "repromptSpeech": "WELCOME_REPROMPT" //Changes this to change the *last* reprompt used.
    },
    "user": {
      "userId": "amzn1.ask.account.AHPUQELLZCI6N3U2VS3EDVPT5MX3EGG45B4M2JRZWZ2PEBONRFSJEPEUIZG32CMP6GQGYDLA7UGMW65IHXJVXU24BEIQGQYVJ7IQAH7EZRYNB3RQPEG6225TYVH2KT63OV4EWQ4UKF5HJHCQEHO2K3YTWO3V5PSOAUF4BU4SSFRNBDQV4ULW6UFKJIL7WF22UI54V4SQY6DZHJI"
    },
    "new": false
  },
  "request": {
    "type": "IntentRequest", //This could be used to figure out LaunchRequest.
    "requestId": "EdwRequestId.3ff3cf6c-fc2a-4de8-98bc-ee0e02068c15",
    "locale": "en-US", //Change locale to change language. Works with en-GB and en-US.
    "timestamp": "2017-02-23T17:42:52Z",
    "intent": {
      "name": "AMAZON.YesIntent", //Change this to change the intent sent -  Options: AMAZON.NoIntent, AMAZON.YesIntent, AMAZON.CancelIntent, AMAZON.StopIntent, AMAZON.RepeatIntent, AMAZON.HelpIntent, BookIntent, Unhandled
      "slots": {}
    }
  },
  "version": "1.0"
}

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
