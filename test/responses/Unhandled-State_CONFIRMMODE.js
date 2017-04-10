const config = require('../test-config');

module.exports = {
  "version": "1.0",
  "response": {
    "outputSpeech": {
      "type": "SSML",
      "ssml": "<speak> Sorry, I didn't get that. Did you want to book that meeting? </speak>"
    },
    "shouldEndSession": false,
    "reprompt": {
      "outputSpeech": {
        "type": "SSML",
        "ssml": "<speak> Say 'yes', or something like 'book it', if you want to book %s. You can also say 'no', or 'cancel', if you don't want the room. </speak>"
      }
    }
  },
  "sessionAttributes": {
    "speechOutput": "Sorry, I didn't get that. Did you want to book that meeting?",
    "STATE": "_CONFIRMMODE",
    "repromptSpeech": "Say 'yes', or something like 'book it', if you want to book %s. You can also say 'no', or 'cancel', if you don't want the room.",
    "startTime": config.startTime,
    "endTime": config.endTime,
    "duration": config.duration,
    "ownerAddress": config.ownerAddress,
    "ownerName": config.ownerName,
    "roomName": config.roomName
  }
}
