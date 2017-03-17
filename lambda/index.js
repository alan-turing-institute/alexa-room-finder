/**
 * @file Main Alexa Skill handling code. Ensure handler is index.handler (which is default)
 * in order to call this as the opening of the file. Must be zipped with requesters.js, and
 * appropriate node_modules in order to work.
 * @summary Handles Alexa skill.
 */

'use strict';

const Alexa = require('alexa-sdk');
const moment = require('moment');
const requesters = require('./requesters'); //For making requests to Graph API

//App ID of Alexa skill, found on Alexa Skill Page. Replace this if you're using this independently.
const APP_ID = 'amzn1.ask.skill.0f4dbef2-9f5c-4fd7-bfbf-8de6b96a95a5';

//Names of all calendars to be looked for as rooms.
const testNames = ['alexaroom1', 'alexaroom2'];

//Object of all states to be used by the code.
const states = {
  RESTARTMODE: '_RESTARTMODE',
  CONFIRMMODE: '_CONFIRMMODE', // Initiated by BookIntent, when user asks to book, and an available room is found.
  TIMEMODE: '_TIMEMODE'
};

//The set of handlers used for the overall session, but mostly to initiate a new session.
const sessionHandlers = {
  //Called when skill is opened without being asked to book a room.
  'LaunchRequest': function() {
    this.attributes.speechOutput = this.t('WELCOME_MESSAGE', this.t('BUSINESS_NAME'));
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
  //Yes calls booking function
  'AMAZON.YesIntent': function() {
    this.emit('BookIntent');
  },
  //Does the key booking function. This is intended to work from a LaunchRequest - i.e. "Ask Room Finder to book me a room."
  'BookIntent': function() {
    this.handler.state = states.TIMEMODE;
    this.attributes.speechOutput = this.t("TIME_DURATION_MESSAGE");
    this.attributes.repromptSpeech = this.t("TIME_DURATION_REPROMPT");
    this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
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

//This set of handlers is only used when you call a StartOver intent from Confirm Mode. Every intent here is an exact copy of its counterpart in sessionhandlers.
const restartModeHandlers = Alexa.CreateStateHandler(states.RESTARTMODE, {
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
  //Yes calls booking function
  'AMAZON.YesIntent': function() {
    this.emitWithState('BookIntent');
  },
  //Does the key booking function. This is intended to work from a LaunchRequest - i.e. "Ask Room Finder to book me a room."
  'BookIntent': function() {
    this.handler.state = states.TIMEMODE;
    this.attributes.speechOutput = this.t("TIME_DURATION_MESSAGE");
    this.attributes.repromptSpeech = this.t("TIME_DURATION_REPROMPT");
    this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
  //Only called when an unhandled intent is sent, which should never happen in the code at present, as there is only one custom intent, so that's effectively always used.
  'Unhandled': function() {
    this.attributes.speechOutput = this.t('UNHANDLED_MESSAGE');
    this.attributes.repromptSpeech = this.t('UNHANDLED_REPROMPT');
    this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
  }
});

const timeModeHandlers = Alexa.CreateStateHandler(states.TIMEMODE, {
  //Gives a different help message
  'AMAZON.HelpIntent': function () {
    this.attributes.speechOutput = this.t('TIME_HELP_MESSAGE', this.attributes.roomName);
    this.attributes.repromptSpeech = this.t('TIME_HELP_REPROMPT', this.attributes.roomName);
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
  //BookIntent is used to finalise a booking.
  'DurationIntent': function() {

    var that = this;

    if(this.event.request.intent.slots.Duration) {

      var bookingDuration = moment.duration(this.event.request.intent.slots.Duration.value);

      console.log(bookingDuration.asMinutes());
      if (bookingDuration.asHours() > 2) {
        this.attributes.speechOutput = this.t('TIME_TOO_LONG_MESSAGE');
        this.attributes.repromptSpeech = this.t('TIME_TOO_LONG_REPROMPT');
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
      } else if (bookingDuration.asHours() <= 0) {
        this.attributes.speechOutput = this.t('TIME_UNHANDLED_MESSAGE');
        this.attributes.repromptSpeech = this.t('TIME_UNHANDLED_REPROMPT');
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
      } else {

        //Define start and end time of period to check
        var startTime = new Date();
        var endTime = new Date(startTime.getTime() + bookingDuration.asMilliseconds());

        //Save dates in attributes as ISO strings, so they can be accessed to post the event later.
        this.attributes.startTime = startTime.toISOString();
        this.attributes.endTime = endTime.toISOString();
        this.attributes.duration = bookingDuration.asMinutes();

        //Retrieves all of the users calendars, with error callback spoken through Alexa.
        requesters.getCalendars(that.event.session.user.accessToken)
        .then(function(parsedCals) {
          //Finds a free room from one of the calendars, with error callback spoken through Alexa.
          requesters.findFreeRoom(that.event.session.user.accessToken, that.attributes.startTime, that.attributes.endTime, testNames, parsedCals)
          .then(function(creds) {
            if (creds) {
              //Changes state to confirm mode, as a free room has been found.
              that.handler.state = states.CONFIRMMODE;

              //Stores the owner of the room and room name as attributes, for later use when booking room.
              that.attributes.ownerAddress = creds.ownerAddress;
              that.attributes.ownerName = creds.ownerName;
              that.attributes.roomName = creds.name;

              that.attributes.speechOutput = that.t('ROOM_AVAILABLE_MESSAGE', that.attributes.roomName);
              that.attributes.repromptSpeech = that.t('ROOM_AVAILABLE_REPROMPT', that.attributes.roomName);
              that.emit(':ask', that.attributes.speechOutput, that.attributes.repromptSpeech);
            } else {
              that.attributes.speechOutput = that.t('TIME_UNAVAILABLE_MESSAGE', that.attributes.duration);
              that.attributes.repromptSpeech = that.t('TIME_UNAVAILABLE_REPROMPT', that.attributes.duration);
              that.emit(':ask', that.attributes.speechOutput, that.attributes.repromptSpeech);
            }
          }, function(roomError) {
            that.emit(':tellWithCard', that.t('ROOM_ERROR'), that.t('ROOM_ERROR_CARD_TITLE'), roomError);
            console.error("\n Room Error: " + roomError);
          });
        }, function(calError) {
          that.emit(':tellWithCard', that.t('CALENDAR_ERROR'), that.t('CALENDAR_ERROR_CARD_TITLE'), calError);
          console.error("\n Calendar Error: " + calError);
        });
      }
    } else {
      this.attributes.speechOutput = this.t('TIME_UNHANDLED_MESSAGE');
      this.attributes.repromptSpeech = this.t('TIME_UNHANDLED_REPROMPT');
      this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    }
  },
  'AMAZON.StartOverIntent':function() {
    this.handler.state = states.RESTARTMODE;
    this.attributes.ownerAddress = undefined;
    this.attributes.ownerName = undefined;
    this.attributes.roomName = undefined;
    this.attributes.startTime = undefined;
    this.attributes.endTime = undefined;
    this.attributes.duration = undefined;

    this.attributes.speechOutput = this.t('WELCOME_MESSAGE', this.t('BUSINESS_NAME'));
    this.attributes.repromptSpeech = this.t('WELCOME_REPROMPT', this.t('SKILL_NAME'));
    this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
  },
  //Only called when an unhandled intent is sent, which should never happen in the code at present, as there is only one custom intent, so that's effectively always used.
  'Unhandled': function() {
    this.attributes.speechOutput = this.t('TIME_UNHANDLED_MESSAGE');
    this.attributes.repromptSpeech = this.t('TIME_UNHANDLED_REPROMPT');
    this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
  }
});
//Set of handlers used after you've confirmed you want to book a room.
const confirmModeHandlers = Alexa.CreateStateHandler(states.CONFIRMMODE, {
  //Gives a different help message
  'AMAZON.HelpIntent': function () {
    this.attributes.speechOutput = this.t('BOOKING_HELP_MESSAGE', this.attributes.roomName);
    this.attributes.repromptSpeech = this.t('BOOKING_HELP_REPROMPT', this.attributes.roomName);
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
  //'Yes' calls booking finalisation function
  'AMAZON.YesIntent': function() {
    this.emitWithState('BookIntent');
  },
  //BookIntent is used to finalise a booking.
  'BookIntent': function() {

    var that = this;

    //Posts room, with error callback spoken through Alexa
    requesters.postRoom(this.event.session.user.accessToken, this.attributes.ownerAddress, this.attributes.ownerName, this.attributes.startTime, this.attributes.endTime).then(function(owner) {
      that.emit(':tellWithCard', that.t('ROOM_BOOKED', that.attributes.ownerName, that.attributes.duration), that.t('CARD_ROOM_BOOKED_TITLE', that.attributes.ownerName), that.t('CARD_ROOM_BOOKED_CONTENT', that.attributes.ownerName, that.attributes.duration));
    }, function(bookError) {
      that.emit(':tellWithCard', that.t('BOOKING_ERROR'), that.t('BOOKING_ERROR_CARD_TITLE'), bookError);
      console.error('Posting Error: ' + bookError);
    });
  },
  'AMAZON.StartOverIntent':function() {
    this.handler.state = states.RESTARTMODE;

    this.attributes.ownerAddress = undefined;
    this.attributes.ownerName = undefined;
    this.attributes.roomName = undefined;
    this.attributes.startTime = undefined;
    this.attributes.endTime = undefined;

    this.attributes.speechOutput = this.t('WELCOME_MESSAGE', this.t('BUSINESS_NAME'));
    this.attributes.repromptSpeech = this.t('WELCOME_REPROMPT', this.t('SKILL_NAME'));
    this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
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
      SKILL_NAME: "Room Finder",
      BUSINESS_NAME: "the Alan Turing Institute",
      WELCOME_MESSAGE: "Would you like to book a meeting room at %s?",
      WELCOME_REPROMPT: "I'm %s. My job is to book meeting rooms! If you need further instructions, just ask me for help.",
      HELP_MESSAGE: "I hunt through all the meeting rooms here, see if one is available for a specified length of time, then I book it for you! Would you like me to book you a meeting?",
      HELP_REPROMPT: "Would you like me to book a meeting for you?",
      UNHANDLED_MESSAGE: "Sorry, I didn't get that. Would you like me to book a meeting room?",
      UNHANDLED_REPROMPT: "Say something like 'book me a meeting' or 'yes' if you'd like to book a meeting.",
      ROOM_AVAILABLE_MESSAGE: "%s is available. Would you like me to book it for you?",
      ROOM_AVAILABLE_REPROMPT: "Would you like me to book %s for you?",
      ROOM_BOOKED: "Great. I've booked %s for %s minutes.",
      CARD_ROOM_BOOKED_TITLE: "%s booked.",
      CARD_ROOM_BOOKED_CONTENT: "I've booked %s for %s minutes.",
      BOOKING_HELP_MESSAGE: "I checked all the meeting rooms for you, and %s is available. Do you want me to book it for you?",
      BOOKING_HELP_REPROMPT: "Say 'yes', or something like 'book it' if you want to book %s, or say 'no' or 'cancel' if you don't.",
      BOOKING_UNHANDLED_MESSAGE: "Sorry, I didn't get that. Do you want to book that meeting?",
      BOOKING_UNHANDLED_REPROMPT: "Please confirm whether you want to book the meeting room I found.",
      TIME_UNHANDLED_MESSAGE: "Sorry, I didn't get that. How long do you want the meeting to be?",
      TIME_UNHANDLED_REPROMPT: "How long do you want the meeting room for?",
      TIME_HELP_MESSAGE: "Please tell me how long you'd like the meeting to be. The maximum is 2 hours, but you can say any duration under that.",
      TIME_HELP_REPROMPT: "Please tell me how long you'd like the meeting to be, or just say 'cancel' or 'stop' to quit.",
      TIME_DURATION_MESSAGE: "How long would you like the meeting to be?",
      TIME_DURATION_REPROMPT: "Please tell me how long you'd like the meeting to be. The maximum is 2 hours.",
      TIME_UNAVAILABLE_MESSAGE: "Sorry, no rooms were available for a %s minute meeting. Maybe give a shorter time, or say 'cancel' if you're done.",
      TIME_UNAVAILABLE_REPROMPT: "No rooms were available for a %s minute meeting. You can give a shorter time, or say 'cancel' if you're done.",
      TIME_TOO_LONG_MESSAGE: "Sorry, I can only book meetings for up to 2 hours. Please give a shorter time.",
      TIME_TOO_LONG_REPROMPT: "Please give me a time shorter than 2 hours, and I'll try to book you a meeting.",
      CALENDAR_ERROR: "There was an error retrieving calendars. Tom has been informed and is looking into it!",
      CALENDAR_ERROR_CARD_TITLE: "Calendar Error",
      ROOM_ERROR: "There was an error retrieving a free room. Tom has been informed and is looking into it!",
      ROOM_ERROR_CARD_TITLE: "Room Error",
      BOOKING_ERROR: "There was an error booking the room. Tom has been informed and is looking into it!",
      BOOKING_ERROR_CARD_TITLE: "Booking Error",
      STOP_MESSAGE: "Alright. Goodbye!"
    },
  },
  'en-US': {
    translation: {
      SKILL_NAME: "Room Finder",
      BUSINESS_NAME: "the Alan Turing Institute",
      WELCOME_MESSAGE: "Would you like to book a meeting room at %s?",
      WELCOME_REPROMPT: "I'm %s. My job is to book meeting rooms! If you need further instructions, just ask me for help.",
      HELP_MESSAGE: "I hunt through all the meeting rooms here, see if one is available for a specified length of time, then I book it for you! Would you like me to book you a meeting?",
      HELP_REPROMPT: "Would you like me to book a meeting for you?",
      UNHANDLED_MESSAGE: "Sorry, I didn't get that. Would you like me to book a meeting room?",
      UNHANDLED_REPROMPT: "Say something like 'book me a meeting' or 'yes' if you'd like to book a meeting.",
      ROOM_AVAILABLE_MESSAGE: "%s is available. Would you like me to book it for you?",
      ROOM_AVAILABLE_REPROMPT: "Would you like me to book %s for you?",
      ROOM_BOOKED: "Great. I've booked %s for %s minutes.",
      CARD_ROOM_BOOKED_TITLE: "%s booked.",
      CARD_ROOM_BOOKED_CONTENT: "I've booked %s for %s minutes.",
      BOOKING_HELP_MESSAGE: "I checked all the meeting rooms for you, and %s is available. Do you want me to book it for you?",
      BOOKING_HELP_REPROMPT: "Say 'yes', or something like 'book it' if you want to book %s, or say 'no' or 'cancel' if you don't.",
      BOOKING_UNHANDLED_MESSAGE: "Sorry, I didn't get that. Do you want to book that meeting?",
      BOOKING_UNHANDLED_REPROMPT: "Please confirm whether you want to book the meeting room I found.",
      TIME_UNHANDLED_MESSAGE: "Sorry, I didn't get that. How long do you want the meeting to be?",
      TIME_UNHANDLED_REPROMPT: "How long do you want the meeting room for?",
      TIME_HELP_MESSAGE: "Please tell me how long you'd like the meeting to be. The maximum is 2 hours, but you can say any duration under that.",
      TIME_HELP_REPROMPT: "Please tell me how long you'd like the meeting to be, or just say 'cancel' or 'stop' to quit.",
      TIME_DURATION_MESSAGE: "How long would you like the meeting to be?",
      TIME_DURATION_REPROMPT: "Please tell me how long you'd like the meeting to be. The maximum is 2 hours.",
      TIME_UNAVAILABLE_MESSAGE: "Sorry, no rooms were available for a %s minute meeting. Maybe give a shorter time, or say 'cancel' if you're done.",
      TIME_UNAVAILABLE_REPROMPT: "No rooms were available for a %s minute meeting. You can give a shorter time, or say 'cancel' if you're done.",
      TIME_TOO_LONG_MESSAGE: "Sorry, I can only book meetings for up to 2 hours. Please give a shorter time.",
      TIME_TOO_LONG_REPROMPT: "Please give me a time shorter than 2 hours, and I'll try to book you a meeting.",
      CALENDAR_ERROR: "There was an error retrieving calendars. Tom has been informed and is looking into it!",
      CALENDAR_ERROR_CARD_TITLE: "Calendar Error",
      ROOM_ERROR: "There was an error retrieving a free room. Tom has been informed and is looking into it!",
      ROOM_ERROR_CARD_TITLE: "Room Error",
      BOOKING_ERROR: "There was an error booking the room. Tom has been informed and is looking into it!",
      BOOKING_ERROR_CARD_TITLE: "Booking Error",
      STOP_MESSAGE: "Alright. Goodbye!"
    },
  }
};

//Main
exports.handler = (event, context) => {
  const alexa = Alexa.handler(event, context);
  alexa.appId = APP_ID; //App ID of Alexa skill, found on skill's page.
  alexa.resources = languageStrings;
  alexa.registerHandlers(sessionHandlers, confirmModeHandlers, restartModeHandlers, timeModeHandlers);
  alexa.execute();
};
