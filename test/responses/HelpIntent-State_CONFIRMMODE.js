const config = require('../test-config');

module.exports = {
  "version": "1.0",
  "response": {
    "outputSpeech": {
      "type": "SSML",
      "ssml": `<speak> I checked all the meeting rooms, and ${config.roomName} is available. Do you want me to book it? </speak>`
    },
    "shouldEndSession": false,
    "reprompt": {
      "outputSpeech": {
        "type": "SSML",
        "ssml": `<speak> Say 'yes', or something like 'book it', if you want to book ${config.roomName}. You can also say 'no', or 'cancel', if you don't want the room. </speak>`
      }
    }
  },
  "sessionAttributes": {
    "speechOutput": `I checked all the meeting rooms, and ${config.roomName} is available. Do you want me to book it?`,
    "STATE": "_CONFIRMMODE",
    "repromptSpeech": `Say 'yes', or something like 'book it', if you want to book ${config.roomName}. You can also say 'no', or 'cancel', if you don't want the room.`,
    "startTime": config.startTime,
    "endTime": config.endTime,
    "duration": config.duration,
    "ownerAddress": config.ownerAddress,
    "ownerName": config.ownerName,
    "roomName": config.roomName,
  }
}
