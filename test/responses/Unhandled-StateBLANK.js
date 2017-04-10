module.exports = {
  "version": "1.0",
  "response": {
    "outputSpeech": {
      "type": "SSML",
      "ssml": "<speak> Sorry, I didn't get that. Would you like me to book a meeting room? </speak>"
    },
    "shouldEndSession": false,
    "reprompt": {
      "outputSpeech": {
        "type": "SSML",
        "ssml": "<speak> Say something like 'book me a meeting', or just 'yes!' if you'd like to book a meeting. </speak>"
      }
    }
  },
  "sessionAttributes": {
    "speechOutput": "Sorry, I didn't get that. Would you like me to book a meeting room?",
    "STATE": "",
    "repromptSpeech": "Say something like 'book me a meeting', or just 'yes!' if you'd like to book a meeting."
  }
}
