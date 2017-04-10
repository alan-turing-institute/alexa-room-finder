module.exports = {
  "version": "1.0",
  "response": {
    "outputSpeech": {
      "type": "SSML",
      "ssml": "<speak> Sorry, I didn't get that. How long do you want the meeting to be? </speak>"
    },
    "shouldEndSession": false,
    "reprompt": {
      "outputSpeech": {
        "type": "SSML",
        "ssml": "<speak> How long do you want the meeting room for? </speak>"
      }
    }
  },
  "sessionAttributes": {
    "speechOutput": "Sorry, I didn't get that. How long do you want the meeting to be?",
    "STATE": "_TIMEMODE",
    "repromptSpeech": "How long do you want the meeting room for?"
  }
}
