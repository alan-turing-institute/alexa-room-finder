const config = require('../test-config')

module.exports = {
  "version": "1.0",
  "response": {
    "outputSpeech": {
      "type": "SSML",
      "ssml": `<speak> ${config.ownerName} is available. Would you like me to book it? </speak>`
    },
    "shouldEndSession": false,
    "reprompt": {
      "outputSpeech": {
        "type": "SSML",
        "ssml": `<speak> Would you like me to book ${config.ownerName} for you? </speak>`
      }
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
