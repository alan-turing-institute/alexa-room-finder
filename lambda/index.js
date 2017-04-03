/**
 * @file Main Alexa Skill handling code. Ensure handler is index.handler (which is default)
 * in order to call this as the opening of the file. Must be zipped with requesters.js, and
 * appropriate node_modules in order to work.
 * @summary Handles Alexa skill.
 */

'use strict';

const Alexa = require('alexa-sdk');
const moment = require('moment');
const requesters = require('./requesters');
const config = require('./config');
const resources = require('./resources');

// Object of all states to be used by the code.
const states = {
  CONFIRMMODE: '_CONFIRMMODE', // Initiated by BookIntent, when user asks to book, and an available room is found.
  TIMEMODE: '_TIMEMODE',
};

/**
 * resetAttributes - resets all non-state attributes to undefined
 *
 * NB: Must be bound to the correct this
 */
function resetAttributes() {
  this.attributes.ownerAddress = undefined;
  this.attributes.ownerName = undefined;
  this.attributes.roomName = undefined;
  this.attributes.startTime = undefined;
  this.attributes.endTime = undefined;
  this.attributes.duration = undefined;
  this.attributes.speechOutput = undefined;
  this.attributes.repromptSpeech = undefined;
}

/**
 * The set of handlers used for when a new session is inititated.
 */
const sessionHandlers = {
  // Called when skill is opened without being asked to book a room.
  LaunchRequest() {
    this.emit(':askHandler',
      this.t('WELCOME_MESSAGE', this.t('BUSINESS_NAME')),
      this.t('WELCOME_REPROMPT', this.t('SKILL_NAME')));
  },
  // Gives a help message
  'AMAZON.HelpIntent': function HelpIntent() {
    this.emit(':askHandler',
      this.t('HELP_MESSAGE'),
      this.t('HELP_REPROMPT'));
  },
  // Repeats last messages
  'AMAZON.RepeatIntent': function RepeatIntent() {
    this.emit(':repeatHandler');
  },
  // Stop, cancel, and no, all end session.
  'AMAZON.StopIntent': function StopIntent() {
    this.emit('SessionEndedRequest');
  },
  'AMAZON.CancelIntent': function CancelIntent() {
    this.emit('SessionEndedRequest');
  },
  'AMAZON.NoIntent': function NoIntent() {
    this.emit('SessionEndedRequest');
  },
  // Yes calls booking function
  'AMAZON.YesIntent': function YesIntent() {
    this.emit('BookIntent');
  },
  // Does key booking function. Works from LaunchRequest - i.e. "Ask Room Finder to find a room."
  BookIntent() {
    this.handler.state = states.TIMEMODE;

    this.emit(':askHandler',
      this.t('TIME_DURATION_MESSAGE'),
      this.t('TIME_DURATION_REPROMPT'));
  },
  // Only called when an unhandled intent is sent.
  Unhandled() {
    this.emit(':askHandler',
      this.t('UNHANDLED_MESSAGE'),
      this.t('UNHANDLED_REPROMPT'));
  },
  // Called from all state handlers when the session ends without a booking made.
  SessionEndedRequest() {
    this.emit(':tell', this.t('STOP_MESSAGE'));
  },
};

/**
 * The set of handlers used to ask user how long they want to book the room for.
 *
 * states.TIMEMODE is appeneded to all the Intent names of this string.
 */
const timeModeHandlers = Alexa.CreateStateHandler(states.TIMEMODE, {
  // Gives a different help message
  'AMAZON.HelpIntent': function HelpIntent() {
    this.emit(':askHandler',
      this.t('TIME_HELP_MESSAGE', this.attributes.roomName),
      this.t('TIME_HELP_REPROMPT', this.attributes.roomName));
  },
  // Repeats last messages
  'AMAZON.RepeatIntent': function RepeatIntent() {
    this.emit(':repeatHandler');
  },
  // Stop, cancel, and no, all end session.
  'AMAZON.StopIntent': function StopIntent() {
    this.emit('SessionEndedRequest');
  },
  'AMAZON.CancelIntent': function CancelIntent() {
    this.emit('SessionEndedRequest');
  },
  'AMAZON.NoIntent': function NoIntent() {
    this.emit('SessionEndedRequest');
  },
  // DurationIntent gets duration, and books room.
  DurationIntent() {
    const bookingDuration = moment.duration(this.event.request.intent.slots.Duration.value);

    if (bookingDuration) {
      this.emit(':durationHandler', bookingDuration);
    } else {
      // Asks again if no/invalid duration is obtained from intent.
      this.emit(':askHandler',
        this.t('TIME_UNHANDLED_MESSAGE'),
        this.t('TIME_UNHANDLED_MESSAGE'));
    }
  },
  'AMAZON.StartOverIntent': function StartOverIntent() {
    this.emit(':startOverHandler');
  },
  // Only called when an unhandled intent is sent.
  Unhandled() {
    this.emit(':askHandler',
      this.t('TIME_UNHANDLED_MESSAGE'),
      this.t('TIME_UNHANDLED_REPROMPT'));
  },
});

/**
 * Set of handlers used to confirm a booking.
 */
const confirmModeHandlers = Alexa.CreateStateHandler(states.CONFIRMMODE, {
  // Gives a different help message
  'AMAZON.HelpIntent': function HelpIntent() {
    this.emit(':askHandler',
      this.t('BOOKING_HELP_MESSAGE', this.attributes.roomName),
      this.t('BOOKING_HELP_REPROMPT', this.attributes.roomName));
  },
  // Repeats last messages
  'AMAZON.RepeatIntent': function RepeatIntent() {
    this.emit(':repeatHandler');
  },
  // Stop, cancel, and no, all end session.
  'AMAZON.StopIntent': function StopIntent() {
    this.emit('SessionEndedRequest');
  },
  'AMAZON.CancelIntent': function CancelIntent() {
    this.emit('SessionEndedRequest');
  },
  'AMAZON.NoIntent': function NoIntent() {
    this.emit('SessionEndedRequest');
  },
  // 'Yes' calls booking finalisation function
  'AMAZON.YesIntent': function YesIntent() {
    this.emitWithState('BookIntent');
  },
  // BookIntent is used to finalise a booking.
  BookIntent() {
    // Posts room, with error callback spoken through Alexa
    requesters.postRoom(
      this.event.session.user.accessToken,
      this.attributes.ownerAddress,
      this.attributes.ownerName,
      this.attributes.startTime,
      this.attributes.endTime)
    .then(() => {
      this.emit(':tellWithCard',
        this.t('ROOM_BOOKED', this.attributes.ownerName, this.attributes.duration),
        this.t('CARD_ROOM_BOOKED_TITLE', this.attributes.ownerName),
        this.t('CARD_ROOM_BOOKED_CONTENT', this.attributes.ownerName, this.attributes.duration));
    }, (bookError) => {
      this.emit(':errorHandler', bookError);
    });
  },
  'AMAZON.StartOverIntent': function StartOverIntent() {
    this.emit(':startOverHandler');
  },
  // Only called when an unhandled intent is sent.
  Unhandled() {
    this.emit(':askHandler',
      this.t('BOOKING_UNHANDLED_MESSAGE'),
      this.t('BOOKING_UNHANDLED_REPROMPT'));
  },
});

const nonIntentHandlers = {
  ':askHandler': function askHandler(speechOutput, repromptSpeech) {
    this.attributes.speechOutput = speechOutput;
    this.attributes.repromptSpeech = repromptSpeech;
    this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
  },
  ':repeatHandler': function repeatHandler() {
    this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
  },
  ':durationHandler': function durationHandler(bookingDuration) {
    if (bookingDuration.asHours() > 2) {
      // Asks again if too long
      this.emit(':askHandler',
        this.t('TIME_TOO_LONG_MESSAGE'),
        this.t('TIME_TOO_LONG_REPROMPT'));
    } else if (bookingDuration.asHours() <= 0) {
      // Asks again if too short, or not applicable.
      this.emit(':askHandler',
        this.t('TIME_UNHANDLED_MESSAGE'),
        this.t('TIME_UNHANDLED_REPROMPT'));
    } else {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + bookingDuration.asMilliseconds());

      // Save dates in attributes as ISO strings, so they can be accessed to post event.
      this.attributes.startTime = startTime.toISOString();
      this.attributes.endTime = endTime.toISOString();
      this.attributes.duration = bookingDuration.asMinutes();

      this.emit(':getRoomHandler');
    }
  },
  ':getRoomHandler': function getRoomHandler() {
    // Retrieves all of the users calendars, with error callback spoken through Alexa.
    requesters.getCalendars(this.event.session.user.accessToken)
    .then((parsedCals) => {
      // Finds a free room from one of the calendars, with error callback spoken through Alexa.
      requesters.findFreeRoom(
        this.event.session.user.accessToken,
        this.attributes.startTime,
        this.attributes.endTime,
        config.testNames,
        parsedCals)
      .then((creds) => {
        // Stores the owner of the room and room name as attributes, for later use when booking.
        this.attributes.ownerAddress = creds.ownerAddress;
        this.attributes.ownerName = creds.ownerName;
        this.attributes.roomName = creds.name;

        this.emit(':roomFoundHandler', creds);
      }, (roomError) => {
        this.emit(':errorHandler', roomError);
      });
    }, (calError) => {
      this.emit(':errorHandler', calError);
    });
  },
  ':roomFoundHandler': function roomFoundHandler(creds) {
    if (creds) {
      // Asks for confirmation if room is available
      this.handler.state = states.CONFIRMMODE;

      this.emit(':askHandler',
        this.t('ROOM_AVAILABLE_MESSAGE', this.attributes.roomName),
        this.t('ROOM_AVAILABLE_REPROMPT', this.attributes.roomName));
    } else {
      // Asks again if no rooms are available for the specified time.
      this.emit(':askHandler',
        this.t('TIME_UNAVAILABLE_MESSAGE', Math.ceil(parseFloat(this.attributes.duration))),
        this.t('TIME_UNAVAILABLE_REPROMPT', Math.ceil(parseFloat(this.attributes.duration))));
    }
  },
  ':startOverHandler': function startOverHandler() {
    this.handler.state = '';
    this.handler.response.sessionAttributes.STATE = '';

    resetAttributes.call(this);

    this.emitWithState('LaunchRequest');
  },
  ':errorHandler': function errorHandler(error) {
    this.emit(':tellWithCard',
      this.t('ERROR'),
      this.t('ERROR_CARD_TITLE'),
      error);
    console.error(`There was an error: ${error}`);
  },
};

/**
 * Main
 */
exports.handler = (event, context) => {
  const alexa = Alexa.handler(event, context); // See alexa.js in alexa-sdk package for definition.
  alexa.appId = config.appId; // App ID of Alexa skill, found on skill's page.
  alexa.resources = resources.languageStrings; // All strings to be used by program.
  alexa.registerHandlers(
    sessionHandlers,
    confirmModeHandlers,
    timeModeHandlers,
    nonIntentHandlers); // See response.js in alexa-sdk package to see other registered handlers.
  alexa.execute(); // Handles lambda event.
};
