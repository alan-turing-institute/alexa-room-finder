const config = require('../test-config')

module.exports = {
  "version": "1.0",
  "response": {
    "outputSpeech": {
      "type": "SSML",
      "ssml": `<speak> ${config.roomName} is available. Would you like me to book it? </speak>`
    },
    "shouldEndSession": false,
    "reprompt": {
      "outputSpeech": {
        "type": "SSML",
        "ssml": `<speak> Would you like me to book ${config.roomName} for you? </speak>`
      }
    }
  },
  "sessionAttributes": {
    "speechOutput": `${config.roomName} is available. Would you like me to book it?`,
    "STATE": "_CONFIRMMODE",
    "repromptSpeech": `Would you like me to book ${config.roomName} for you?`,
    "startTime": config.startTime,
    "endTime": config.endTime,
    "duration": config.duration,
    "ownerAddress": config.ownerAddress,
    "ownerName": config.ownerName,
    "roomName": config.roomName,
  }
}
