/**
 * @file Functions to check room availability, and then create a meeting
 * on the calendar. All requests to Microsoft Graph API are made here.
 */

'use strict';

var request = require('request');
var Q = require('q');

var requesters = {} //Requesters object to export - 'require'd by index.js

/**
 * requesters.postRoom - given a token and the owner of the room calendar, this books a new event on my calendar, inviting the room.
 *
 * @param  {string} token       The JWT access token provided by the Alexa Skill.
 * @param  {string} ownerAddress       Address of owner of calendar to be booked.
 * @param  {string} ownerName   Name of owner of calendar to be booked.
 * @param  {string} startTime   Start time of meeting to post, formatted as ISO-8601 string.
 * @param  {string} endTime     End time of meeting to post, formatted as ISO-8601 string.
 * @return {promise}            Promise resolved to nothing.
 */
requesters.postRoom = function(token, ownerAddress, ownerName, startTime, endTime) {

  var deferred = Q.defer();

  //Event to be made as JSON
  var newEvent = {
    Subject: 'Alexa\'s Meeting',
    Start: {
      DateTime: startTime,
      TimeZone: 'UTC'
    },
    End: {
      DateTime: endTime,
      TimeZone: 'UTC'
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
        Address: ownerAddress,
        Name: ownerName
      }
    } ]
  }

  var toPost = {
    url: 'https://graph.microsoft.com/v1.0/me/events',
    headers: {
      'content-type': 'application/json',
      authorization: 'Bearer ' + token,
    },
    body: JSON.stringify(newEvent)
  }

  //Posts event
  request.post(toPost, function (err, response, body) {

    var parsedBody = JSON.parse(body); //TODO: Parsed body errors due to incorrect tokens are not handled properly by this code. Place after if(err) to fix.

    if (err) {
      deferred.reject(err);
    } else if (parsedBody.error) {
      deferred.reject(parsedBody.error);
    } else {
      deferred.resolve();
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

  var toGet = {
    url: 'https://graph.microsoft.com/beta/Users/Me/Calendars', //In order to obtain owner, which I'd like to use, the beta endpoint must be used. //TODO: When updated, change this endpoint.
    headers: {
      authorization: 'Bearer ' + token,
    },
  }

  request.get(toGet, function (err, response, body) {
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

  /* For each calendar:
   * - check if its name is in namesToFind.
   * - if it is in namesToFind, check if it's free.
   * - if it is free, return its owner and name in a JSON.
   *
   * This is done asynchronously to speed up the process. This means a
   * system must be built to register if no calendars were free.
   * TODO: Improve the code that registers that no rooms are free, as it's hacky.*/

  var calendarsTotal = parsedCals.length;
  var calendarsUnavailable = 0;

  parsedCals.forEach(function(calendar) {
    if(~namesToFind.indexOf(calendar.name)) {

      var calViewUrl = 'https://graph.microsoft.com/v1.0/Users/Me/Calendars/' + calendar.id.toString() + '/calendarView?startDateTime=' + startTime + '&endDateTime=' + endTime;

      var toGet = {
        url: calViewUrl,
        headers: {
          authorization: 'Bearer ' + token,
        },
      }

      request.get(toGet, function (err, response, body) {
        var parsedBody = JSON.parse(body);
        if (err) {
          deferred.reject(err)
        } else if (parsedBody.error) {
          deferred.reject(parsedBody.error.message)
        } else if (parsedBody.value == '') {
          deferred.resolve({
            "ownerName" : calendar.owner.name,
            "ownerAddress" : calendar.owner.address,
            "name" : calendar.name
          });
        } else {
          calendarsUnavailable += 1;
          if(calendarsUnavailable == calendarsTotal) {
            deferred.resolve(false);
          }
        }
      });
    } else {
      calendarsUnavailable += 1;
      if(calendarsUnavailable == calendarsTotal) {
        deferred.resolve(false);
      }
    }
  });
  return deferred.promise;
}

module.exports = requesters; //Export requesters.
