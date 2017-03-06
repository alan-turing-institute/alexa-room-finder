'use strict';

var request = require('request');

var requesters = {}

requesters.checkRoom = function(token, startTime, endTime, trueCallback, falseCallback, errorCallback) {
  var url = 'https://outlook.office.com/api/v2.0/me/calendarview?startDateTime=' + startTime.toISOString() + '&endDateTime=' + endTime.toISOString();

  request.get({
    url: url,
    headers: {
      authorization: 'Bearer ' + token,
    },
  }, function (err, response, body) {
    var parsedBody = JSON.parse(body);

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
    url: 'https://outlook.office.com/api/v2.0/me/events',
    headers: {
      'content-type': 'application/json',
      authorization: 'Bearer ' + token,
    },
    body: JSON.stringify(newEvent)
  }, function (err, response, body) {
    var parsedBody = JSON.parse(body);

    if (err) {
      errorCallback(err);
    } else if (parsedBody.error) {
      errorCallback(parsedBody.error)
    } else {
      successCallback();
    }
  });
}

module.exports = requesters;
