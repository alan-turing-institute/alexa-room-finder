/**
 * @file Exports the functions to check room availability, and then create a meeting
 * on the calendar. Accessible using 'require(./requesters)'
 */

'use strict';

var request = require('request');

var requesters = {} //Requesters object to export - required by index.js

/**
 * requesters.checkRoom - Checks on default calendar, between a start and end time, checks if
 * there are any events then, and calls an appropriate callback based off this.
 *
 * @param  {string} token       The OAuth2 access token provided by the Alexa Skill
 * @param  {date} startTime     The start time of the period to check
 * @param  {date} endTime       The end time of the period to check
 * @param  {function} trueCallback  Called if there are no events (a room is free)
 * @param  {function} falseCallback Called if there are events (a room isn't free)
 * @param  {function} errorCallback Called if there is an error
 * @return {null}
 */

requesters.checkRoom = function(token, startTime, endTime, trueCallback, falseCallback, errorCallback) {
  var url = 'https://graph.microsoft.com/v1.0/me/calendarview?startDateTime=' + startTime.toISOString() + '&endDateTime=' + endTime.toISOString(); //Using Office REST API v2.0 Endpoint

  request.get({
    url: url,
    headers: {
      authorization: 'Bearer ' + token,
    },
  }, function (err, response, body) {
    var parsedBody = JSON.parse(body); //TODO: Parsed body errors don't seem to be handled properly by this code.

    if (err) {
      errorCallback(err)
    } else if (parsedBody.error) {
      errorCallback(parsedBody.error.message);
    } else if (parsedBody.value == ''){
      trueCallback();
    } else {
      falseCallback();
    }
  });
}

/**
 * requesters.postRoom - Creates a half-an-hour event on default calendar, with a success and error callback
 *
 * @param  {string} token         The OAuth2 access token provided by the Alexa Skill
 * @param  {date} startTime       The start time of the meeting to be created
 * @param  {date} endTime         The end time of the meeting to be created
 * @param  {function} successCallback Called if there isn't an error
 * @param  {function} errorCallback   Called if there is an error
 * @return {null}
 */

requesters.postRoom = function(token, startTime, endTime, successCallback, errorCallback) {
  var newEvent = {
    Subject: 'Test meeting event to be created',
    Start: {
      DateTime: startTime,
      TimeZone: 'GMT'
    },
    End: {
      DateTime: endTime,
      TimeZone: 'GMT'
    },
    Body: {
      Content: 'This meeting was booked by Alexa.',
      ContentType: 'Text'
    },
    Attendees : [ {
      Status: {
        Response: 'NotResponded',
        Time: startTime
      },
      Type: 'Required',
      EmailAddress: {
        Address: 'alexa@turing.ac.uk',
        Name: 'Alexa'
      }
    } ]
  }

  request.post({
    url: 'https://graph.microsoft.com/v1.0/me/events', //Using Office REST API v2.0 Endpoint
    headers: {
      'content-type': 'application/json',
      authorization: 'Bearer ' + token,
    },
    body: JSON.stringify(newEvent)
  }, function (err, response, body) {
    var parsedBody = JSON.parse(body); //TODO: Parsed body errors don't seem to be handled properly by this code.

    if (err) {
      errorCallback(err);
    } else if (parsedBody.error) {
      errorCallback(parsedBody.error)
    } else {
      successCallback();
    }
  });
}

module.exports = requesters; //Export requesters.
