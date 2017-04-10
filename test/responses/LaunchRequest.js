module.exports = {
  "version": "1.0",
  "response": {
    "outputSpeech": {
      "type": "SSML",
      "ssml": "<speak> Would you like to book a meeting room at the Turing? </speak>"
    },
    "shouldEndSession": false,
    "reprompt": {
      "outputSpeech": {
        "type": "SSML",
        "ssml": "<speak> I'm Room Finder. My job is to book meeting rooms! If you need further instructions, just ask me for help. </speak>"
      }
    }
  },
  "sessionAttributes": {
    "STATE": "",
    "speechOutput": "Would you like to book a meeting room at the Turing?",
    "repromptSpeech": "I'm Room Finder. My job is to book meeting rooms! If you need further instructions, just ask me for help."
  }
};
