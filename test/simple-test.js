const lambdaLocal = require('lambda-local');

describe.skip('Check responses return at all', function () {

  describe('Blank State:', function () {
    this.timeout(5000);

    describe('\nLaunchRequest\n', function () {
      it('should return response', function (done) {
        const request = require('./requests/LaunchRequest.js');
        lambdaLocal.execute({
          event: request,
          lambdaPath: './lambda/index.js',
          profileName: 'default',
          timeoutMs: 3000,
          callback: done,
        });
      });
    });

    describe('\nBookIntent\n', function () {
      it('should return response', function (done) {
        const request = require('./requests/BookIntent-StateBLANK.js');
        lambdaLocal.execute({
          event: request,
          lambdaPath: './lambda/index.js',
          profileName: 'default',
          timeoutMs: 3000,
          callback: done,
        });
      });
    });

    describe('\nCancelIntent\n', function () {
      it('should return response', function (done) {
        const request = require('./requests/CancelIntent-StateBLANK.js');
        lambdaLocal.execute({
          event: request,
          lambdaPath: './lambda/index.js',
          profileName: 'default',
          timeoutMs: 3000,
          callback: done,
        });
      });
    });

    describe('\nDurationIntent\n', function () {
      it('should return response', function (done) {
        const request = require('./requests/DurationIntent-StateBLANK.js');
        lambdaLocal.execute({
          event: request,
          lambdaPath: './lambda/index.js',
          profileName: 'default',
          timeoutMs: 3000,
          callback: done,
        });
      });
    });

    describe('\nHelpIntent\n', function () {
      it('should return response', function (done) {
        const request = require('./requests/HelpIntent-StateBLANK.js');
        lambdaLocal.execute({
          event: request,
          lambdaPath: './lambda/index.js',
          profileName: 'default',
          timeoutMs: 3000,
          callback: done,
        });
      });
    });

    describe('\nNoIntent\n', function () {
      it('should return response', function (done) {
        const request = require('./requests/NoIntent-StateBLANK.js');
        lambdaLocal.execute({
          event: request,
          lambdaPath: './lambda/index.js',
          profileName: 'default',
          timeoutMs: 3000,
          callback: done,
        });
      });
    });

    describe('\nRepeatIntent\n', function () {
      it('should return response', function (done) {
        const request = require('./requests/RepeatIntent-StateBLANK.js');
        lambdaLocal.execute({
          event: request,
          lambdaPath: './lambda/index.js',
          profileName: 'default',
          timeoutMs: 3000,
          callback: done,
        });
      });
    });

    describe('\nStartOverIntent\n', function () {
      it('should return response', function (done) {
        const request = require('./requests/StartOverIntent-StateBLANK.js');
        lambdaLocal.execute({
          event: request,
          lambdaPath: './lambda/index.js',
          profileName: 'default',
          timeoutMs: 3000,
          callback: done,
        });
      });
    });

    describe('\nStopIntent\n', function () {
      it('should return response', function (done) {
        const request = require('./requests/StopIntent-StateBLANK.js');
        lambdaLocal.execute({
          event: request,
          lambdaPath: './lambda/index.js',
          profileName: 'default',
          timeoutMs: 3000,
          callback: done,
        });
      });
    });

    describe('\nYesIntent\n', function () {
      it('should return response', function (done) {
        const request = require('./requests/YesIntent-StateBLANK.js');
        lambdaLocal.execute({
          event: request,
          lambdaPath: './lambda/index.js',
          profileName: 'default',
          timeoutMs: 3000,
          callback: done,
        });
      });
    });
  });

  describe('TIMEMODE State:', function () {
    this.timeout(5000);

    describe('\nBookIntent\n', function () {
      it('should return response', function (done) {
        const request = require('./requests/BookIntent-State_TIMEMODE.js');
        lambdaLocal.execute({
          event: request,
          lambdaPath: './lambda/index.js',
          profileName: 'default',
          timeoutMs: 3000,
          callback: done,
        });
      });
    });

    describe('\nCancelIntent\n', function () {
      it('should return response', function (done) {
        const request = require('./requests/CancelIntent-State_TIMEMODE.js');
        lambdaLocal.execute({
          event: request,
          lambdaPath: './lambda/index.js',
          profileName: 'default',
          timeoutMs: 3000,
          callback: done,
        });
      });
    });

    describe('\nDurationIntent\n', function () {
      it('should return response', function (done) {
        const request = require('./requests/DurationIntent-State_TIMEMODE.js');
        lambdaLocal.execute({
          event: request,
          lambdaPath: './lambda/index.js',
          profileName: 'default',
          timeoutMs: 3000,
          callback: done,
        });
      });
    });

    describe('\nHelpIntent\n', function () {
      it('should return response', function (done) {
        const request = require('./requests/HelpIntent-State_TIMEMODE.js');
        lambdaLocal.execute({
          event: request,
          lambdaPath: './lambda/index.js',
          profileName: 'default',
          timeoutMs: 3000,
          callback: done,
        });
      });
    });

    describe('\nNoIntent\n', function () {
      it('should return response', function (done) {
        const request = require('./requests/NoIntent-State_TIMEMODE.js');
        lambdaLocal.execute({
          event: request,
          lambdaPath: './lambda/index.js',
          profileName: 'default',
          timeoutMs: 3000,
          callback: done,
        });
      });
    });

    describe('\nRepeatIntent\n', function () {
      it('should return response', function (done) {
        const request = require('./requests/RepeatIntent-State_TIMEMODE.js');
        lambdaLocal.execute({
          event: request,
          lambdaPath: './lambda/index.js',
          profileName: 'default',
          timeoutMs: 3000,
          callback: done,
        });
      });
    });

    describe('\nStartOverIntent\n', function () {
      it('should return response', function (done) {
        const request = require('./requests/StartOverIntent-State_TIMEMODE.js');
        lambdaLocal.execute({
          event: request,
          lambdaPath: './lambda/index.js',
          profileName: 'default',
          timeoutMs: 3000,
          callback: done,
        });
      });
    });

    describe('\nStopIntent\n', function () {
      it('should return response', function (done) {
        const request = require('./requests/StopIntent-State_TIMEMODE.js');
        lambdaLocal.execute({
          event: request,
          lambdaPath: './lambda/index.js',
          profileName: 'default',
          timeoutMs: 3000,
          callback: done,
        });
      });
    });

    describe('\nYesIntent\n', function () {
      it('should return response', function (done) {
        const request = require('./requests/YesIntent-State_TIMEMODE.js');
        lambdaLocal.execute({
          event: request,
          lambdaPath: './lambda/index.js',
          profileName: 'default',
          timeoutMs: 3000,
          callback: done,
        });
      });
    });
  });

  describe('CONFIRMMODE State:', function () {
    this.timeout(5000);

    describe('\nBookIntent\n', function () {
      it('should return response', function (done) {
        const request = require('./requests/BookIntent-State_CONFIRMMODE.js');
        lambdaLocal.execute({
          event: request,
          lambdaPath: './lambda/index.js',
          profileName: 'default',
          timeoutMs: 3000,
          callback: done,
        });
      });
    });

    describe('\nCancelIntent\n', function () {
      it('should return response', function (done) {
        const request = require('./requests/CancelIntent-State_CONFIRMMODE.js');
        lambdaLocal.execute({
          event: request,
          lambdaPath: './lambda/index.js',
          profileName: 'default',
          timeoutMs: 3000,
          callback: done,
        });
      });
    });

    describe('\nDurationIntent\n', function () {
      it('should return response', function (done) {
        const request = require('./requests/DurationIntent-State_CONFIRMMODE.js');
        lambdaLocal.execute({
          event: request,
          lambdaPath: './lambda/index.js',
          profileName: 'default',
          timeoutMs: 3000,
          callback: done,
        });
      });
    });

    describe('\nHelpIntent\n', function () {
      it('should return response', function (done) {
        const request = require('./requests/HelpIntent-State_CONFIRMMODE.js');
        lambdaLocal.execute({
          event: request,
          lambdaPath: './lambda/index.js',
          profileName: 'default',
          timeoutMs: 3000,
          callback: done,
        });
      });
    });

    describe('\nNoIntent\n', function () {
      it('should return response', function (done) {
        const request = require('./requests/NoIntent-State_CONFIRMMODE.js');
        lambdaLocal.execute({
          event: request,
          lambdaPath: './lambda/index.js',
          profileName: 'default',
          timeoutMs: 3000,
          callback: done,
        });
      });
    });

    describe('\nRepeatIntent\n', function () {
      it('should return response', function (done) {
        const request = require('./requests/RepeatIntent-State_CONFIRMMODE.js');
        lambdaLocal.execute({
          event: request,
          lambdaPath: './lambda/index.js',
          profileName: 'default',
          timeoutMs: 3000,
          callback: done,
        });
      });
    });

    describe('\nStartOverIntent\n', function () {
      it('should return response', function (done) {
        const request = require('./requests/StartOverIntent-State_CONFIRMMODE.js');
        lambdaLocal.execute({
          event: request,
          lambdaPath: './lambda/index.js',
          profileName: 'default',
          timeoutMs: 3000,
          callback: done,
        });
      });
    });

    describe('\nStopIntent\n', function () {
      it('should return response', function (done) {
        const request = require('./requests/StopIntent-State_CONFIRMMODE.js');
        lambdaLocal.execute({
          event: request,
          lambdaPath: './lambda/index.js',
          profileName: 'default',
          timeoutMs: 3000,
          callback: done,
        });
      });
    });

    describe('\nYesIntent\n', function () {
      it('should return response', function (done) {
        const request = require('./requests/YesIntent-State_CONFIRMMODE.js');
        lambdaLocal.execute({
          event: request,
          lambdaPath: './lambda/index.js',
          profileName: 'default',
          timeoutMs: 3000,
          callback: done,
        });
      });
    });
  });
});
