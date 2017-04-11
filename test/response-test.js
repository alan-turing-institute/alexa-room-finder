const lambdaLocal = require('lambda-local');
const expect = require('chai').expect;

describe('Blank State:', function () {
  this.timeout(3500);

  describe("LaunchRequest", function () {
    it("should return welcome response", function (done) {
      const request = require('./requests/LaunchRequest.js');
      const response = require('./responses/LaunchRequest.js')
      lambdaLocal.execute({
        event: request,
        lambdaPath: './lambda/index.js',
        profileName: 'default',
        timeoutMs: 3000,
        mute: true,
        callback(err, data) {
          if (err) {
            throw err;
          } else {
            expect(data).eql(response);
            done();
          }
        },
      });
    });
  });

  describe("BookIntent", function () {
    it("should change state to TIMEMODE", function (done) {
      const request = require('./requests/BookIntent-StateBLANK.js');
      const response = require('./responses/BookIntent-StateBLANK.js')
      lambdaLocal.execute({
        event: request,
        lambdaPath: './lambda/index.js',
        profileName: 'default',
        timeoutMs: 3000,
        mute: true,
        callback(err, data) {
          if (err) {
            throw err;
          } else {
            expect(data).eql(response);
            done();
          }
        },
      });
    });
  });

  describe('CancelIntent', function () {
    it('should end session', function (done) {
      const request = require('./requests/CancelIntent-StateBLANK.js');
      const response = require('./responses/SessionEndedRequest.js');
      lambdaLocal.execute({
        event: request,
        lambdaPath: './lambda/index.js',
        profileName: 'default',
        timeoutMs: 3000,
        mute: true,
        callback(err, data) {
          if (err) {
            throw err;
          } else {
            expect(data.response).eql(response.response);
            done();
          }
        },
      });
    });
  });

  describe('DurationIntent', function () {
    it('should return unhandled', function (done) {
      const request = require('./requests/DurationIntent-StateBLANK.js');
      const response = require('./responses/Unhandled-StateBLANK.js');
      lambdaLocal.execute({
        event: request,
        lambdaPath: './lambda/index.js',
        profileName: 'default',
        timeoutMs: 3000,
        mute: true,
        callback(err, data) {
          if (err) {
            throw err;
          } else {
            expect(data).eql(response);
            done();
          }
        },
      });
    });
  });

  describe('HelpIntent', function () {
    it('should return help response', function (done) {
      const request = require('./requests/HelpIntent-StateBLANK.js');
      const response = require('./responses/HelpIntent-StateBLANK.js');
      lambdaLocal.execute({
        event: request,
        lambdaPath: './lambda/index.js',
        profileName: 'default',
        timeoutMs: 3000,
        mute: true,
        callback(err, data) {
          if (err) {
            throw err;
          } else {
            expect(data).eql(response);
            done();
          }
        },
      });
    });
  });

  describe('NoIntent', function () {
    it('should end session', function (done) {
      const request = require('./requests/NoIntent-StateBLANK.js');
      const response = require('./responses/SessionEndedRequest.js');
      lambdaLocal.execute({
        event: request,
        lambdaPath: './lambda/index.js',
        profileName: 'default',
        timeoutMs: 3000,
        mute: true,
        callback(err, data) {
          if (err) {
            throw err;
          } else {
            expect(data.response).eql(response.response);
            done();
          }
        },
      });
    });
  });

  describe('RepeatIntent', function () {
    it('should repeat (LaunchRequest here)', function (done) {
      const request = require('./requests/RepeatIntent-StateBLANK.js');
      const response = require('./responses/LaunchRequest.js');
      lambdaLocal.execute({
        event: request,
        lambdaPath: './lambda/index.js',
        profileName: 'default',
        timeoutMs: 3000,
        mute: true,
        callback(err, data) {
          if (err) {
            throw err;
          } else {
            expect(data).eql(response);
            done();
          }
        },
      });
    });
  });

  describe('StartOverIntent', function () {
    it('should return unhandled', function (done) {
      const request = require('./requests/StartOverIntent-StateBLANK.js');
      const response = require('./responses/Unhandled-StateBLANK.js');
      lambdaLocal.execute({
        event: request,
        lambdaPath: './lambda/index.js',
        profileName: 'default',
        timeoutMs: 3000,
        mute: true,
        callback(err, data) {
          if (err) {
            throw err;
          } else {
            expect(data).eql(response);
            done();
          }
        },
      });
    });
  });

  describe('StopIntent', function () {
    it('should end session', function (done) {
      const request = require('./requests/StopIntent-StateBLANK.js');
      const response = require('./responses/SessionEndedRequest.js');
      lambdaLocal.execute({
        event: request,
        lambdaPath: './lambda/index.js',
        profileName: 'default',
        timeoutMs: 3000,
        mute: true,
        callback(err, data) {
          if (err) {
            throw err;
          } else {
            expect(data.response).eql(response.response);
            done();
          }
        },
      });
    });
  });

  describe('YesIntent', function () {
    it('should return correct response', function (done) {
      const request = require('./requests/YesIntent-StateBLANK.js');
      const response = require('./responses/BookIntent-StateBLANK.js');
      lambdaLocal.execute({
        event: request,
        lambdaPath: './lambda/index.js',
        profileName: 'default',
        timeoutMs: 3000,
        mute: true,
        callback(err, data) {
          if (err) {
            throw err;
          } else {
            expect(data).eql(response);
            done();
          }
        },
      });
    });
  });
});

describe('TIMEMODE State:', function () {
  this.timeout(3500);

  describe('BookIntent', function () {
    it('should return correct response', function (done) {
      const request = require('./requests/BookIntent-State_TIMEMODE.js');
      const response = require('./responses/Unhandled-State_TIMEMODE.js');
      lambdaLocal.execute({
        event: request,
        lambdaPath: './lambda/index.js',
        profileName: 'default',
        timeoutMs: 3000,
        mute: true,
        callback(err, data) {
          if (err) {
            throw err;
          } else {
            expect(data).eql(response);
            done();
          }
        },
      });
    });
  });

  describe('CancelIntent', function () {
    it('should end session', function (done) {
      const request = require('./requests/CancelIntent-State_TIMEMODE.js');
      const response = require('./responses/SessionEndedRequest.js');
      lambdaLocal.execute({
        event: request,
        lambdaPath: './lambda/index.js',
        profileName: 'default',
        timeoutMs: 3000,
        mute: true,
        callback(err, data) {
          if (err) {
            throw err;
          } else {
            expect(data.response).eql(response.response);
            done();
          }
        },
      });
    });
  });

  describe('DurationIntent', function () {
    it('should change state to _CONFIRMMODE', function (done) {
      const request = require('./requests/DurationIntent-State_TIMEMODE.js');
      lambdaLocal.execute({
        event: request,
        lambdaPath: './lambda/index.js',
        profileName: 'default',
        timeoutMs: 3000,
        mute: true,
        callback(err, data) {
          if (err) {
            throw err;
          } else {
            expect(data.sessionAttributes.STATE).eql("_CONFIRMMODE");
            done();
          }
        },
      });
    });
  });

  describe('HelpIntent', function () {
    it('should return help response', function (done) {
      const request = require('./requests/HelpIntent-State_TIMEMODE.js');
      const response = require('./responses/HelpIntent-State_TIMEMODE.js');
      lambdaLocal.execute({
        event: request,
        lambdaPath: './lambda/index.js',
        profileName: 'default',
        timeoutMs: 3000,
        mute: true,
        callback(err, data) {
          if (err) {
            throw err;
          } else {
            expect(data).eql(response);
            done();
          }
        },
      });
    });
  });

  describe('NoIntent', function () {
    it('should end session', function (done) {
      const request = require('./requests/NoIntent-State_TIMEMODE.js');
      const response = require('./responses/SessionEndedRequest.js');
      lambdaLocal.execute({
        event: request,
        lambdaPath: './lambda/index.js',
        profileName: 'default',
        timeoutMs: 3000,
        mute: true,
        callback(err, data) {
          if (err) {
            throw err;
          } else {
            expect(data.response).eql(response.response);
            done();
          }
        },
      });
    });
  });

  describe('RepeatIntent', function () {
    it('should repeat (basic time message)', function (done) {
      const request = require('./requests/RepeatIntent-State_TIMEMODE.js');
      const response = require('./responses/BookIntent-StateBLANK.js');
      lambdaLocal.execute({
        event: request,
        lambdaPath: './lambda/index.js',
        profileName: 'default',
        timeoutMs: 3000,
        mute: true,
        callback(err, data) {
          if (err) {
            throw err;
          } else {
            expect(data).eql(response);
            done();
          }
        },
      });
    });
  });

  describe('StartOverIntent', function () {
    it('should return LaunchRequest', function (done) {
      const request = require('./requests/StartOverIntent-State_TIMEMODE.js');
      const response = require('./responses/LaunchRequest.js');
      lambdaLocal.execute({
        event: request,
        lambdaPath: './lambda/index.js',
        profileName: 'default',
        timeoutMs: 3000,
        mute: true,
        callback(err, data) {
          if (err) {
            throw err;
          } else {
            expect(data).eql(response);
            done();
          }
        },
      });
    });
  });

  describe('StopIntent', function () {
    it('should end session', function (done) {
      const request = require('./requests/StopIntent-State_TIMEMODE.js');
      const response = require('./responses/SessionEndedRequest.js');
      lambdaLocal.execute({
        event: request,
        lambdaPath: './lambda/index.js',
        profileName: 'default',
        timeoutMs: 3000,
        mute: true,
        callback(err, data) {
          if (err) {
            throw err;
          } else {
            expect(data.response).eql(response.response);
            done();
          }
        },
      });
    });
  });


  describe('YesIntent', function () {
    it('should return unhandled', function (done) {
      const request = require('./requests/YesIntent-State_TIMEMODE.js');
      const response = require('./responses/Unhandled-State_TIMEMODE.js');
      lambdaLocal.execute({
        event: request,
        lambdaPath: './lambda/index.js',
        profileName: 'default',
        timeoutMs: 3000,
        mute: true,
        callback(err, data) {
          if (err) {
            throw err;
          } else {
            expect(data).eql(response);
            done();
          }
        },
      });
    });
  });
});

describe('CONFIRMMODE State:', function () {
  this.timeout(3500);

  describe('BookIntent', function () {
    it('should book room', function (done) {
      const request = require('./requests/BookIntent-State_CONFIRMMODE.js');
      const response = require('./responses/BookIntent-State_CONFIRMMODE.js');
      lambdaLocal.execute({
        event: request,
        lambdaPath: './lambda/index.js',
        profileName: 'default',
        timeoutMs: 3000,
        mute: true,
        callback(err, data) {
          if (err) {
            throw err;
          } else {
            expect(data).eql(response);
            done();
          }
        },
      });
    });
  });

  describe('CancelIntent', function () {
    it('should end session', function (done) {
      const request = require('./requests/CancelIntent-State_CONFIRMMODE.js');
      const response = require('./responses/SessionEndedRequest.js');
      lambdaLocal.execute({
        event: request,
        lambdaPath: './lambda/index.js',
        profileName: 'default',
        timeoutMs: 3000,
        mute: true,
        callback(err, data) {
          if (err) {
            throw err;
          } else {
            expect(data.response).eql(response.response);
            done();
          }
        },
      });
    });
  });

  describe('DurationIntent', function () {
    it('should return unhandled', function (done) {
      const request = require('./requests/DurationIntent-State_CONFIRMMODE.js');
      const response = require('./responses/Unhandled-State_CONFIRMMODE.js');
      lambdaLocal.execute({
        event: request,
        lambdaPath: './lambda/index.js',
        profileName: 'default',
        timeoutMs: 3000,
        mute: true,
        callback(err, data) {
          if (err) {
            throw err;
          } else {
            expect(data).eql(response);
            done();
          }
        },
      });
    });
  });

  describe('HelpIntent', function () {
    it('should return help response', function (done) {
      const request = require('./requests/HelpIntent-State_CONFIRMMODE.js');
      const response = require('./responses/HelpIntent-State_CONFIRMMODE.js');
      lambdaLocal.execute({
        event: request,
        lambdaPath: './lambda/index.js',
        profileName: 'default',
        timeoutMs: 3000,
        mute: true,
        callback(err, data) {
          if (err) {
            throw err;
          } else {
            expect(data).eql(response);
            done();
          }
        },
      });
    });
  });

  describe('NoIntent', function () {
    it('should end session', function (done) {
      const request = require('./requests/NoIntent-State_CONFIRMMODE.js');
      const response = require('./responses/SessionEndedRequest.js');
      lambdaLocal.execute({
        event: request,
        lambdaPath: './lambda/index.js',
        profileName: 'default',
        timeoutMs: 3000,
        mute: true,
        callback(err, data) {
          if (err) {
            throw err;
          } else {
            expect(data.response).eql(response.response);
            done();
          }
        },
      });
    });
  });

  describe('RepeatIntent', function () {
    it('should repeat (basic confirm message)', function (done) {
      const request = require('./requests/RepeatIntent-State_CONFIRMMODE.js');
      const response = require('./responses/RepeatIntent-State_CONFIRMMODE.js');
      lambdaLocal.execute({
        event: request,
        lambdaPath: './lambda/index.js',
        profileName: 'default',
        timeoutMs: 3000,
        mute: true,
        callback(err, data) {
          if (err) {
            throw err;
          } else {
            expect(data).eql(response);
            done();
          }
        },
      });
    });
  });

  describe('StartOverIntent', function () {
    it('should return LaunchRequest', function (done) {
      const request = require('./requests/StartOverIntent-State_CONFIRMMODE.js');
      const response = require('./responses/LaunchRequest.js');
      lambdaLocal.execute({
        event: request,
        lambdaPath: './lambda/index.js',
        profileName: 'default',
        timeoutMs: 3000,
        mute: true,
        callback(err, data) {
          if (err) {
            throw err;
          } else {
            expect(data).eql(response);
            done();
          }
        },
      });
    });
  });

  describe('StopIntent', function () {
    it('should end session', function (done) {
      const request = require('./requests/StopIntent-State_CONFIRMMODE.js');
      const response = require('./responses/SessionEndedRequest.js');
      lambdaLocal.execute({
        event: request,
        lambdaPath: './lambda/index.js',
        profileName: 'default',
        timeoutMs: 3000,
        mute: true,
        callback(err, data) {
          if (err) {
            throw err;
          } else {
            expect(data.response).eql(response.response);
            done();
          }
        },
      });
    });
  });

  describe('YesIntent', function () {
    it('should book room', function (done) {
      const request = require('./requests/YesIntent-State_CONFIRMMODE.js');
      const response = require('./responses/BookIntent-State_CONFIRMMODE.js');
      lambdaLocal.execute({
        event: request,
        lambdaPath: './lambda/index.js',
        profileName: 'default',
        timeoutMs: 3000,
        mute: true,
        callback(err, data) {
          if (err) {
            throw err;
          } else {
            expect(data).eql(response);
            done();
          }
        },
      });
    });
  });
});
