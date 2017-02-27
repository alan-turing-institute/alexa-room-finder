/*Main handling code, to be uploaded to AWS Lambda*/

'use strict';

const Alexa = require('alexa-sdk')
const APP_ID = 'amzn1.ask.skill.9ed5a39f-9d07-4e65-91ce-d16d59cbca0c'; //App ID of Alexa skill, found on Alexa skill page.

const states = {
  BOOKMODE: '_BOOKMODE' // initiated by BookIntent, when user agrees to book.
};

//The set of handlers used for the overall session, but mostly to initiate a new session.
const sessionHandlers = {
  //This is called when Room Booker is opened.
  /*TODO: Consider using LaunchRequest instead, and to work with the ask method of launching.
  Issue: using LaunchRequest in the conventional way suggested by the SDK leads to crashes on tests.*/
  'LaunchRequest': function() {
    this.attributes.speechOutput = this.t('WELCOME_MESSAGE');
    this.attributes.repromptSpeech = this.t('WELCOME_REPROMPT', this.t('SKILL_NAME'));
    this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
  },
  'AMAZON.HelpIntent': function () {
    this.attributes.speechOutput = this.t('HELP_MESSAGE');
    this.attributes.repromptSpeech = this.t('HELP_REPROMPT');
    this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
  },
  'AMAZON.RepeatIntent': function () {
    this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
  },
  'AMAZON.StopIntent': function () {
    this.emit('SessionEndedRequest');
  },
  'AMAZON.CancelIntent': function () {
    this.emit('SessionEndedRequest');
  },
  'AMAZON.NoIntent': function() {
    this.emit('SessionEndedRequest');
  },
  'AMAZON.YesIntent': function() {
    this.emit('BookIntent');
  },
  //Does the key booking function. This could work from a LaunchRequest in future versions - i.e. "ask Room Booker to book a room"
  'BookIntent': function() {
    this.handler.state = states.BOOKMODE;
    this.attributes.speechOutput = this.t('ROOM_AVAILABLE_MESSAGE', this.t('WHICH_ROOM'));
    this.attributes.repromptSpeech = this.t('ROOM_AVAILABLE_REPROMPT', this.t('WHICH_ROOM'));
    this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
  },
  //Only called when an unhandled intent is sent, which should basically never happen in the code at present, as there is only one custom intent, so that's basically always used.
  'Unhandled': function() {
    this.attributes.speechOutput = this.t('UNHANDLED_MESSAGE');
    this.attributes.repromptSpeech = this.t('UNHANDLED_REPROMPT');
    this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
  },
  //Called from all state handlers when the session ends without a booking being made. Also called in general session ed.
  'SessionEndedRequest': function () {
    this.emit(':tell', this.t('STOP_MESSAGE'));
  },
};

//Set of handlers used after you've confirmed you want to book a room.
const bookModeHandlers = Alexa.CreateStateHandler(states.BOOKMODE, {
  'AMAZON.HelpIntent': function () {
    this.attributes.speechOutput = this.t('BOOKING_HELP_MESSAGE', this.t('WHICH_ROOM'));
    this.attributes.repromptSpeech = this.t('BOOKING_HELP_REPROMPT', this.t('WHICH_ROOM'));
    this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
  },
  'AMAZON.RepeatIntent': function () {
    this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
  },
  'AMAZON.StopIntent': function () {
    this.handler.state='';
    this.emitWithState('SessionEndedRequest');
  },
  'AMAZON.CancelIntent': function () {
    this.handler.state='';
    this.emitWithState('SessionEndedRequest');
  },
  'AMAZON.NoIntent': function() {
    this.handler.state='';
    this.emitWithState('SessionEndedRequest');
  },
  'AMAZON.YesIntent': function() {
    this.emit(':tell', this.t('ROOM_BOOKED', this.t('WHICH_ROOM')));
  },
  //Only called when an unhandled intent is sent, which should basically never happen in the code at present.
  'Unhandled': function() {
    this.attributes.speechOutput = this.t('BOOKING_UNHANDLED_MESSAGE');
    this.attributes.repromptSpeech = this.t('BOOKING_UNHANDLED_REPROMPT');
    this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
  }
});

//All strings used are below. Only 'en-GB' is required.
//It will break if used in America without en-US, so it's sensible to include.
const languageStrings = {
  'en-GB': {
    translation: {
      SKILL_NAME: "Room Booker",
      WELCOME_MESSAGE: "Would you like to book a room for half an hour?",
      WELCOME_REPROMPT: "I'm %s. My job is to book you a room! For further instructions, please ask for help.",
      HELP_MESSAGE: "I can book one of the meeting rooms for you for half an hour. Would you like me to book you a room?",
      HELP_REPROMPT: "Would you like me to book a meeting room for you?",
      UNHANDLED_MESSAGE: "Sorry, I didn't get that. Would you like me to book a room?",
      UNHANDLED_REPROMPT: "I can book meeting rooms for you. Why don't you book a room?",
      ROOM_AVAILABLE_MESSAGE: "Room %s is available. Would you like me to book it for you?",
      ROOM_AVAILABLE_REPROMPT: "Would you like me to book room %s for you?",
      ROOM_UNAVAIABLE_MESSAGE: "Sorry, no rooms are available right now. Maybe try again later!",
      WHICH_ROOM: "1.4",
      ROOM_BOOKED: "Great. I have booked room %s for you.",
      BOOKING_HELP_MESSAGE: "I checked the rooms, and room %s is available. Say yes if you'd like to book it.",
      BOOKING_HELP_REPROMPT: "Say yes if you want to book room %s, or no if you don't.",
      BOOKING_UNHANDLED_MESSAGE: "Sorry, I didn't get that. Did you want that room?",
      BOOKING_UNHANDLED_REPROMPT: "Please confirm if you want that room I found. Bye!",
      STOP_MESSAGE: "Alright. Goodbye!"
    },
  },
  'en-US': {
    translation: {
      SKILL_NAME: "Room Booker",
      WELCOME_MESSAGE: "Would you like to book a room for 30 minutes?",
      WELCOME_REPROMPT: "I'm %s. My job is to book you a room! For further instructions, please ask for help.",
      HELP_MESSAGE: "I can book one of the meeting rooms for you for 30 minutes. Would you like me to book you a room?",
      HELP_REPROMPT: "Would you like me to book a meeting room for you?",
      UNHANDLED_MESSAGE: "Sorry, I didn't get that. Would you like me to book a room?",
      UNHANDLED_REPROMPT: "I can book meeting rooms for you. Why don't you book a room?",
      ROOM_AVAILABLE_MESSAGE: "Room %s is available. Would you like me to book it for you?",
      ROOM_AVAILABLE_REPROMPT: "Would you like me to book room %s for you?",
      ROOM_UNAVAIABLE_MESSAGE: "Sorry, no rooms are available right now. Maybe try again later!",
      WHICH_ROOM: "1.4",
      ROOM_BOOKED: "Great. I have booked room %s for you.",
      BOOKING_HELP_MESSAGE: "I checked the rooms, and room %s is available. Say yes if you'd like to book it.",
      BOOKING_HELP_REPROMPT: "Say yes if you want to book room %s, or no if you don't.",
      BOOKING_UNHANDLED_MESSAGE: "Sorry, I didn't get that. Did you want that room?",
      BOOKING_UNHANDLED_REPROMPT: "Please confirm if you want that room I found. Bye!",
      STOP_MESSAGE: "Alright. Goodbye!"
    },
  }
};

//Main
exports.handler = (event, context) => {
  const alexa = Alexa.handler(event, context);
  alexa.APP_ID = APP_ID; //App ID of Alexa skill, found on skill's page.
  alexa.resources = languageStrings;
  alexa.registerHandlers(sessionHandlers, startModeHandlers, bookModeHandlers);
  alexa.execute();
};
