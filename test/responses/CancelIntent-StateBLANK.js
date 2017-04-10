module.exports = {
  "version": "1.0",
  "response": {
    "outputSpeech": {
      "type": "SSML",
      "ssml": "<speak> Alright. Goodbye! </speak>"
    },
    "shouldEndSession": true
  },
  "sessionAttributes": {
    "speechOutput": "Would you like to book a meeting room at the Turing?",
    "STATE": "",
    "repromptSpeech": "I'm Room Finder. My job is to book meeting rooms! If you need further instructions, just ask me for help."
  }
}
