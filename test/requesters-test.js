const requesters = require('../lambda/requesters');
const config = require('./test-config');
const expect = require("chai").expect;
const request = require('request');
const Q = require('q');
const moment = require('moment');

describe.skip('Test requesters work', function() {

  describe('getCalendars', function () {
    let promiseResult;

    before(function () {
      return requesters.getCalendars(config.token).then((parsedCals) => {
        promiseResult = parsedCals;
        console.info(parsedCals);
      }, (error) => {
        throw error;
      });
    });

    it ('should return an array', function () {
      expect(promiseResult).to.be.an('array')
    });
    it ('should have calendar keys', function () {
      promiseResult.forEach((cal) => {
        expect(cal).to.include.keys('id', 'name', 'owner');
      })
    })
    it ('should return usable owner object', function () {
      promiseResult.forEach((cal) => {
        expect(cal.owner).to.include.keys('name', 'address');
      })
    });
  });

  describe('findFreeRoom', function () {
    let promiseResult;

    before(function () {
      return requesters.getCalendars(config.token)
      .then((parsedCals) => {
        return requesters.findFreeRoom(config.token,
          config.startTime,
          config.endTime,
          [config.roomName],
          parsedCals)
        .then((creds) => {
          promiseResult = creds;
        }, (err) => {
          throw err;
        });
      }, (err) => {
        throw err;
      });
    });

    it('should have owner, name, and ownername', function () {
      expect(promiseResult).to.include.keys('name');
    });
  });

  describe('postRoom', function () {
    function checkPost() {
      const deferred = Q.defer()
      request.get({
        url: `https://graph.microsoft.com/v1.0/Users/Me/Calendar/calendarView?startDateTime=${config.startTime}&endDateTime=${config.endTime}`,
        headers: {
          authorization: `Bearer ${config.token}`,
        },
      }, (err, response, body) => {
        const parsedBody = JSON.parse(body);

        if (err) {
          deferred.reject(err);
        } else if (parsedBody.error) {
          deferred.reject(parsedBody.error);
        } else {
          deferred.resolve(parsedBody.value);
        }
      });
      return deferred.promise;
    }

    let promiseResult;
    let last;

    before(function () {
      return requesters.postRoom(config.token, config.ownerAddress, config.ownerName, config.startTime, config.endTime).then(() => {
        return checkPost().then((value) => {
          promiseResult = value;
          last = promiseResult[promiseResult.length - 1];
        }, (err) => {
          throw err;
        });
      }, (err) => {
        throw err;
      });
    });

    it('should have at least one event posted', function () {
      expect(promiseResult).not.to.be.empty;
    });

    it('should have right start time', function () {
      const startTime = new Date(last.start.dateTime).toISOString();
      expect(startTime).eqls(config.startTime);
      expect(last.end.timeZone).eqls('UTC');
    });

    it('should have right end time', function () {
      const endTime = new Date(last.end.dateTime).toISOString();
      expect(endTime).eqls(config.endTime);
      expect(last.end.timeZone).eqls('UTC');
    });

    it('should have invited one room', function () {
      expect(last.attendees.length).equals(1);
    });

    it('should have invited the right room', function () {
      expect(last.attendees[0].type).eqls('required');
      expect(last.attendees[0].emailAddress.name).eqls(config.ownerName);
      expect(last.attendees[0].emailAddress.address).eqls(config.ownerAddress);
    });
  });
});
