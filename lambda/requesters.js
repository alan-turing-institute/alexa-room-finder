/**
 * @file Exports the functions to check room availability, and then create a meeting
 * on the calendar. Accessible using 'require(./requesters)'
 */

'use strict';

var request = require('request'); //For http requests to REST API
var Q = require('q'); //For promises

var requesters = {} //Requesters object to export - 'require'd by index.js

/**
 * requesters.postRoom - given a token and the owner of the room calendar, this books a new event on my calendar, inviting the room.
 *
 * @param  {string} token       The JWT access token provided by the Alexa Skill.
 * @param  {string} owner       Address of owner of calendar to be booked.
 * @param  {string} startTime   Start time of meeting to post, formatted as ISO-8601 string.
 * @param  {string} endTime     End time of meeting to post, formatted as ISO-8601 string.
 * @return {promise}            Promise resolved to the owner of calendar used. //TODO: This owner is not actually used by index.js, but was (and may be) useful for debug. Change before production.
 */
requesters.postRoom = function(token, owner, startTime, endTime) {

  var deferred = Q.defer();

  //Structure of event to be made
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
        Name: 'Alexa' //TODO: I forgot to include the actual owner's name. This has to be updated.
      }
    } ]
  }

  //Posts event
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
 * requesters.getCalendars - retrieves all of user's calendars from Office 365
 *
 * @param  {string} token The JWT access token provided by the Alexa Skill
 * @return {promise}      Promise resolved to JSON containing all calendars.
 */
requesters.getCalendars = function(token) {

  var deferred = Q.defer();

  request.get({
    url: 'https://graph.microsoft.com/beta/Users/Me/Calendars', //In order to obtain owner, which I'd like to use, the beta endpoint must be used. //TODO: When updated, change this endpoint.
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
      deferred.resolve(parsedBody.value);
    }
  });
  return deferred.promise;
}



/**
 * requesters.findFreeRoom - finds a free room when given a set of calendars to use, a start time and an end time.
 *
 * @param  {string} token       The JWT access token provided by the Alexa Skill
 * @param  {string} startTime   The start time of the period to check, formatted as an ISO 8601 string.
 * @param  {string} endTime     The end time of the period to check, formatted as an ISO 8601 string.
 * @param  {array} namesToFind  Array containing the names of all calendars to search for
 * @param  {object} parsedCals  JSON containing all calendars returned by requesters.
 * @return {promise}            Promise resolved to JSON object containing owner of calendar and name of calendar.
 */
requesters.findFreeRoom = function(token, startTime, endTime, namesToFind, parsedCals) {

  var deferred = Q.defer();

  /*For each calendar:
   * - check if its name is in namesToFind.
   * - if it is in namesToFind, check if it's free.
   * - if it is free, return its owner and name in a JSON.
   *
   * TODO: Add some way for it to register no rooms on the list being free.*/
  parsedCals.forEach(function(calendar) {
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
            "owner" : calendar.owner.address.toString(), //TODO: Add owner name, and rename owner address
            "name" : calendar.name
          });
        }
      });
    }
  });
  return deferred.promise;
}

module.exports = requesters; //Export requesters.
