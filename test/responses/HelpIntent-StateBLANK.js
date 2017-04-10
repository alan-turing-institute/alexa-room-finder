module.exports = {
  "version": "1.0",
  "response": {
    "outputSpeech": {
      "type": "SSML",
      "ssml": "<speak> I look through all the meeting rooms here, see if one is available for a specified length of time, then book it for you! Say 'yes', or 'book a room', to continue. </speak>"
    },
    "shouldEndSession": false,
    "reprompt": {
      "outputSpeech": {
        "type": "SSML",
        "ssml": "<speak> Would you like me to book a meeting room for you? Say 'yes', or 'book me a meeting', to continue. </speak>"
      }
    }
  },
  "sessionAttributes": {
    "speechOutput": "I look through all the meeting rooms here, see if one is available for a specified length of time, then book it for you! Say 'yes', or 'book a room', to continue.",
    "STATE": "",
    "repromptSpeech": "Would you like me to book a meeting room for you? Say 'yes', or 'book me a meeting', to continue."
  }
}
