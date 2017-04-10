module.exports = {
  "version": "1.0",
  "response": {
    "outputSpeech": {
      "type": "SSML",
      "ssml": "<speak> How long would you like the meeting to be? </speak>"
    },
    "shouldEndSession": false,
    "reprompt": {
      "outputSpeech": {
        "type": "SSML",
        "ssml": "<speak> Please tell me how long you'd like the meeting to be. The maximum is 2 hours. </speak>"
      }
    }
  },
  "sessionAttributes": {
    "speechOutput": "How long would you like the meeting to be?",
    "STATE": "_TIMEMODE",
    "repromptSpeech": "Please tell me how long you'd like the meeting to be. The maximum is 2 hours."
  }
}
