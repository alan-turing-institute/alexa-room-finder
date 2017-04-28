/**
 * @file Functions to check room availability, and then create a meeting
 * on the calendar. All requests to Microsoft Graph API are made here.
 */

'use strict';

const request = require('request');
const Q = require('q');

const requesters = {}; // Requesters object to export - 'require'd by index.js

/**
 * requesters.postRoom - Book a new event on a calendar using parameters as time.
 *
 * @param  {string} token          The JWT access token provided by the Alexa Skill.
 * @param  {string} ownerAddress   Address of owner of calendar to be booked.
 * @param  {string} ownerName      Name of owner of calendar to be booked.
 * @param  {string} startTime      Start time of meeting to post, formatted as ISO-8601 string.
 * @param  {string} endTime        End time of meeting to post, formatted as ISO-8601 string.
 * @return {promise}               Promise resolved to nothing.
 */
requesters.postRoom = function postRoom(token, ownerAddress, ownerName, startTime, endTime) {
  const deferred = Q.defer();

  // Event to be made as JSON
  const newEvent = {
    Subject: 'Alexa\'s Meeting',
    Start: {
      DateTime: startTime,
      TimeZone: 'UTC',
    },
    End: {
      DateTime: endTime,
      TimeZone: 'UTC',
    },
    Body: {
      Content: 'This meeting was booked by Alexa.',
      ContentType: 'Text',
    },
    Attendees: [{
      Status: {
        Response: 'NotResponded',
        Time: startTime,
      },
      Type: 'Required',
      EmailAddress: {
        Address: ownerAddress,
        Name: ownerName,
      },
    }],
  };

  const toPost = {
    url: 'https://graph.microsoft.com/v1.0/me/events',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(newEvent),
  };

  // Posts event
  request.post(toPost, (err, response, body) => {
    // TODO: Parsed body errors due to bad tokens aren't handled properly. Fix needed.
    const parsedBody = JSON.parse(body);

    if (err) {
      deferred.reject(err);
    } else if (parsedBody.error) {
      deferred.reject(parsedBody.error);
    } else {
      deferred.resolve();
    }
  });
  return deferred.promise;
};


/**
 * requesters.getCalendars - Retrieve all of user's calendars from API
 *
 * @param  {string} token The JWT access token provided by the Alexa Skill
 * @return {promise}      Promise resolved to JSON containing all calendars.
 */
requesters.getCalendars = function getCalendars(token) {
  const deferred = Q.defer();

  const toGet = {
    /* In order to obtain owner, which I require for consistency, the beta endpoint must be used.
     * TODO: When stable versions are updated, change this endpoint. */
    url: 'https://graph.microsoft.com/beta/Users/Me/Calendars',
    headers: {
      authorization: `Bearer ${token}`,
    },
  };

  request.get(toGet, (err, response, body) => {
    const parsedBody = JSON.parse(body);

    if (err) {
      deferred.reject(err);
    } else if (parsedBody.error) {
      deferred.reject(parsedBody.error.message);
    } else {
      deferred.resolve(parsedBody.value);
    }
  });
  return deferred.promise;
};

/**
 * requesters.findFreeRoom - Find a free calendar, given particular calendars to check.
 *
 * @param  {string} token       The JWT access token provided by the Alexa Skill
 * @param  {string} startTime   The start time of the period to check, formatted as ISO-8601 string
 * @param  {string} endTime     The end time of the period to check, formatted as ISO-8601 string
 * @param  {string[]} names     Array containing the names of all calendars to search for
 * @param  {Object} parsedCals  JSON containing all calendars returned by requesters
 * @return {promise}            Promise resolved to JSON object: ownerName, ownerAdress, name
 */
requesters.findFreeRoom = function findFreeRoom(token, startTime, endTime, names, parsedCals) {
  const deferred = Q.defer();

  /* For each calendar:
   * - check if its name is in 'names'.
   * - if it is in 'names', check if it's free.
   * - if it is free, return its owner and name in a JSON.
   *
   * This is done asynchronously to speed up the process. This means a
   * system must be built to register if no calendars were free.
   * TODO: Improve the code that registers that no rooms are free, as it's hacky.*/

  const calendarsTotal = parsedCals.length;
  let calendarsUnavailable = 0;

  parsedCals.forEach((calendar) => {
    if (names.indexOf(calendar.owner.name) >= 0) {
      const calViewUrl = `https://graph.microsoft.com/v1.0/Users/Me/Calendars/${calendar.id.toString()}/calendarView?startDateTime=${startTime}&endDateTime=${endTime}`;

      const toGet = {
        url: calViewUrl,
        headers: {
          authorization: `Bearer ${token}`,
        },
      };

      request.get(toGet, (err, response, body) => {
        const parsedBody = JSON.parse(body);
        if (err) {
          deferred.reject(err);
        } else if (parsedBody.error) {
          deferred.reject(parsedBody.error.message);
        } else if (parsedBody.value && parsedBody.value.length === 0) {
          deferred.resolve({
            ownerName: calendar.owner.name,
            ownerAddress: calendar.owner.address,
          });
        } else {
          calendarsUnavailable += 1;
          if (calendarsUnavailable === calendarsTotal) {
            deferred.resolve(false);
          }
        }
      });
    } else {
      calendarsUnavailable += 1;
      if (calendarsUnavailable === calendarsTotal) {
        deferred.resolve(false);
      }
    }
  });
  return deferred.promise;
};

module.exports = requesters; // Export requesters.
