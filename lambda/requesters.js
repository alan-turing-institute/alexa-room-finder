/**
 * @file Exports the functions to check room availability, and then create a meeting
 * on the calendar. Accessible using 'require(./requesters)'
 */

'use strict';

var request = require('request');
var Q = require('q');

var requesters = {} //Requesters object to export - 'require'd by index.js

/**
 * requesters.postRoom - given a token and the owner of the room calendar, this books a new event on my calendar, inviting the room.
 *
 * @param  {string} token       The OAuth/JWT access token provided by the Alexa Skill
 * @param  {string} owner       Address of owner of calendar to be booked
 * @param  {string} startTime   ISO-formatted string with start time
 * @param  {string} endTime     ISO-formatted string with end time
 * @return {promise}
 */


requesters.postRoom = function(token, owner, startTime, endTime) {

  var deferred = Q.defer();

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
        Address: owner,
        Name: 'Alexa'
      }
    } ]
  }

  request.post({
    url: 'https://graph.microsoft.com/v1.0/me/events',
    headers: {
      'content-type': 'application/json',
      authorization: 'Bearer ' + token,
    },
    body: JSON.stringify(newEvent)
  }, function (err, response, body) {
    var parsedBody = JSON.parse(body); //TODO: Parsed body errors don't seem to be handled properly by this code.

    if (err) {
      deferred.reject(err);
    } else if (parsedBody.error) {
      deferred.reject(parsedBody.error);
    } else {
      deferred.resolve(owner);
    }
  });
  return deferred.promise;
}

/**
 * requesters.findFreeRoomByName - takes a set of names of calendars, and returns one free one. Performed asynchronously for speed.
 *
 * @param  {string} token       The OAuth/JWT access token to use in request
 * @param  {string} startTime   ISO String showing start time
 * @param  {string} endTime     ISO String showing end time
 * @param  {array} namesToFind  The set of names to check
 * @return {promise}            Promise containing name and owner in an object
 */
requesters.findFreeRoomByName = function(token, startTime, endTime, namesToFind) {

  var deferred = Q.defer();

  request.get({
    url: 'https://graph.microsoft.com/beta/Users/Me/Calendars', //In order to obtain owner, the beta endpoint must be used. //TODO: When updated, change this endpoint.
    headers: {
      authorization: 'Bearer ' + token,
    },
  }, function (err, response, body) {
    var parsedBody = JSON.parse(body);

    if (err) {
      deferred.reject(err);
    } else if (parsedBody.error) {
      deferred.reject(parsedBody.error.message)
    } else {
      parsedBody.value.forEach(function(calendar) {
        if(~namesToFind.indexOf(calendar.name)) {

          var calViewUrl = 'https://graph.microsoft.com/v1.0/Users/Me/Calendars/' + calendar.id.toString() + '/calendarView?startDateTime=' + startTime + '&endDateTime=' + endTime;

          request.get({
            url: calViewUrl,
            headers: {
              authorization: 'Bearer ' + token,
            },
          }, function (err, response, body) {
            var parsedBody = JSON.parse(body);
            if (err) {
              deferred.reject(err)
            } else if (parsedBody.error) {
              deferred.reject(parsedBody.error.message)
            } else if (parsedBody.value == ''){
              deferred.resolve({
                "owner" : calendar.owner.address.toString(),
                "name" : calendar.name
              });
            }
          });
        }
      });
    }
  });
  return deferred.promise;
}

module.exports = requesters; //Export requesters.
