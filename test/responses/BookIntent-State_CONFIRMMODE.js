const config = require('../test-config');

module.exports = {
  "version": "1.0",
  "response": {
    "outputSpeech": {
      "type": "SSML",
      "ssml":`<speak> Great. I've booked ${config.ownerName} for 60 minutes. </speak>`
    },
    "shouldEndSession": true,
    "card": {
      "type": "Simple",
      "title": `${config.ownerName} booked.`,
      "content": `I've booked ${config.ownerName} for 60 minutes.`
    }
  },
  "sessionAttributes": {
    "speechOutput": `${config.ownerName} is available. Would you like me to book it?`,
    "STATE": "_CONFIRMMODE",
    "repromptSpeech": `Would you like me to book ${config.ownerName} for you?`,
    "startTime": config.startTime,
    "endTime": config.endTime,
    "duration": config.duration,
    "durationInMinutes": config.durationInMinutes,
    "ownerAddress": config.ownerAddress,
    "ownerName": config.ownerName,
  }
}
