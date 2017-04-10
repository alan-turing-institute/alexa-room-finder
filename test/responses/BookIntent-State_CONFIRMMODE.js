const config = require('../test-config');

module.exports = {
  "version": "1.0",
  "response": {
    "outputSpeech": {
      "type": "SSML",
      "ssml":`<speak> Great. I've booked ${config.roomName} for 60 minutes. </speak>`
    },
    "shouldEndSession": true,
    "card": {
      "type": "Simple",
      "title": `${config.roomName} booked.`,
      "content": `I've booked ${config.roomName} for 60 minutes.`
    }
  },
  "sessionAttributes": {
    "speechOutput": "alexaroom1 is available. Would you like me to book it?",
    "STATE": "_CONFIRMMODE",
    "repromptSpeech": "Would you like me to book alexaroom1 for you?",
    "startTime": config.startTime,
    "endTime": config.endTime,
    "duration": config.duration,
    "ownerAddress": config.ownerAddress,
    "ownerName": config.ownerName,
    "roomName": config.roomName,
  }
}
