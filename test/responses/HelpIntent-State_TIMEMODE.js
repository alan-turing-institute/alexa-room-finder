module.exports = {
  "version": "1.0",
  "response": {
    "outputSpeech": {
      "type": "SSML",
      "ssml": "<speak> Please tell me how long you'd like the meeting to be. The maximum is 2 hours, but you can say any duration under that. </speak>"
    },
    "shouldEndSession": false,
    "reprompt": {
      "outputSpeech": {
        "type": "SSML",
        "ssml": "<speak> Please say how long you'd like the meeting to be, or just say 'cancel', or 'stop', to quit. </speak>"
      }
    }
  },
  "sessionAttributes": {
    "speechOutput": "Please tell me how long you'd like the meeting to be. The maximum is 2 hours, but you can say any duration under that.",
    "STATE": "_TIMEMODE",
    "repromptSpeech": "Please say how long you'd like the meeting to be, or just say 'cancel', or 'stop', to quit."
  }
}
