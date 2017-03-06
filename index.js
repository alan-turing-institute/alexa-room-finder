/*Main handling code, to be uploaded to AWS Lambda*/

'use strict';

const Alexa = require('alexa-sdk')
var requesters = require('./requesters')

//App ID of Alexa skill, found on Alexa Skill Page. Replace this if you're using this independently.
const APP_ID = 'amzn1.ask.skill.9ed5a39f-9d07-4e65-91ce-d16d59cbca0c';

const states = {
  CONFIRMMODE: '_CONFIRMMODE' // Initiated by BookIntent, when user asks to book, and room is found.
};

//The set of handlers used for the overall session, but mostly to initiate a new session.
const sessionHandlers = {
  //Called when Room Booker is opened without being asked to book a room.
  'LaunchRequest': function() {
    this.attributes.speechOutput = this.t('WELCOME_MESSAGE');
    this.attributes.repromptSpeech = this.t('WELCOME_REPROMPT', this.t('SKILL_NAME'));
    this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
  },
  //Gives a help message
  'AMAZON.HelpIntent': function () {
    this.attributes.speechOutput = this.t('HELP_MESSAGE');
    this.attributes.repromptSpeech = this.t('HELP_REPROMPT');
    this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
  },
  //Repeats last messages
  'AMAZON.RepeatIntent': function () {
    this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
  },
  //Stop, cancel, and no, all end session. Can be individually edited for more complex conversations.
  'AMAZON.StopIntent': function () {
    this.emit('SessionEndedRequest');
  },
  'AMAZON.CancelIntent': function () {
    this.emit('SessionEndedRequest');
  },
  'AMAZON.NoIntent': function() {
    this.emit('SessionEndedRequest');
  },
  //Yes calls booking function.
  'AMAZON.YesIntent': function() {
    this.emit('BookIntent');
  },
  //Does the key booking function. This is intended to work from a LaunchRequest - i.e. "Ask room booker to book me a room."
  'BookIntent': function() {

    var that = this;

    var startTime = new Date();
    var endTime = new Date(startTime.getTime() + 30 * 60000);

    requesters.checkRoom(this.event.session.user.accessToken, startTime, endTime, function() {
      that.handler.state = states.CONFIRMMODE;
      that.attributes.speechOutput = that.t('ROOM_AVAILABLE_MESSAGE', that.t('WHICH_ROOM'));
      that.attributes.repromptSpeech = that.t('ROOM_AVAILABLE_REPROMPT', that.t('WHICH_ROOM'));
      that.emit(':ask', that.attributes.speechOutput, that.attributes.repromptSpeech);
    }, function() {
      that.emit(':tell', that.t('ROOM_UNAVAILABLE_MESSAGE'));
    }, function(error) {
      that.emit(':tell', "An error occurred" + error);
    });
  },
  //Only called when an unhandled intent is sent, which should never happen in the code at present, as there is only one custom intent, so that's effectively always used.
  'Unhandled': function() {
    this.attributes.speechOutput = this.t('UNHANDLED_MESSAGE');
    this.attributes.repromptSpeech = this.t('UNHANDLED_REPROMPT');
    this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
  },
  //Called from all state handlers when the session ends without a booking being made. Also called in general session.
  'SessionEndedRequest': function () {
    this.emit(':tell', this.t('STOP_MESSAGE'));
  },
};

//Set of handlers used after you've confirmed you want to book a room.
const confirmModeHandlers = Alexa.CreateStateHandler(states.CONFIRMMODE, {
  //Gives a different help message
  'AMAZON.HelpIntent': function () {
    this.attributes.speechOutput = this.t('BOOKING_HELP_MESSAGE', this.t('WHICH_ROOM'));
    this.attributes.repromptSpeech = this.t('BOOKING_HELP_REPROMPT', this.t('WHICH_ROOM'));
    this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
  },
  //Repeats last messages
  'AMAZON.RepeatIntent': function () {
    this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
  },
  //Stop, cancel, and no, all end session. Can be individually edited for more complex conversations.
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
  //Yes calls booking finalisation function
  'AMAZON.YesIntent': function() {
    this.emitWithState('BookIntent');
  },
  //BookIntent is here used to finalise a booking
  'BookIntent': function() {

    var that = this;

    var startTime = new Date(); //TODO Fix this so it uses the same start and end time as the previous one.
    var endTime = new Date(startTime.getTime() + 30 * 60000);

    requesters.postRoom(this.event.session.user.accessToken, startTime, endTime, function() {
      that.emit(':tell', that.t('ROOM_BOOKED', that.t('WHICH_ROOM')));
    }, function(error) {
      that.emit(':tell', "An error occurred: " + error);
    });

  },
  'AMAZON.StartOverIntent':function() {
    this.handler.state='';
    this.emitWithState('LaunchRequest');
  },
  //Only called when an unhandled intent is sent, which should never happen in the code at present, as there is only one custom intent, so that's effectively always used.
  'Unhandled': function() {
    this.attributes.speechOutput = this.t('BOOKING_UNHANDLED_MESSAGE');
    this.attributes.repromptSpeech = this.t('BOOKING_UNHANDLED_REPROMPT');
    this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
  }
});

//All strings used are below. Here, only 'en-GB' should be required.
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
      ROOM_UNAVAILABLE_MESSAGE: "Sorry, no rooms are available right now. Maybe try again later!",
      WHICH_ROOM: "Tom",
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
      ROOM_UNAVAILABLE_MESSAGE: "Sorry, no rooms are available right now. Maybe try again later!",
      WHICH_ROOM: "Tom",
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
  alexa.registerHandlers(sessionHandlers, confirmModeHandlers);
  alexa.execute();
};
