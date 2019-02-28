'use strict';

const assert = require('assert');
const MockLinux = require('./mocks/linux');
const mockRequire = require('mock-require');
const MockEpoll = require('./mocks/epoll');
const TestHelper = require('./utils/test-promise')

mockRequire('epoll', MockEpoll);
const Gpio = require('../onoff').Gpio;


describe('write', () => {
  let gpio;
  let pin;

  beforeEach(() => {
    pin = 4;
    MockLinux.gpio(pin);
    gpio = new Gpio(pin, 'in');
  });


  it('writes high', (done) => {
    const expected = 1;
    gpio.write(expected, (err) => {
      const actual = MockLinux.read(pin);
      assert.deepEqual(actual, expected);
      done();
    });
  });

  it('writes low', (done) => {
    const expected = 0;
    gpio.write(expected, (err) => {
      const actual = MockLinux.read(pin);
      assert.deepEqual(actual, expected);
      done();
    });
  });

  afterEach(() => {
    gpio.unexport();
    MockLinux.restore();
  });
});

describe('write Promise', () => {
  let gpio;
  let pin;

  beforeEach(() => {
    pin = 4;
    MockLinux.gpio(pin);
    gpio = new Gpio(pin, 'in');
  });

  it('writes high', () => {
    const expected = 1;
    return gpio.write(expected).then(() => {
      const actual = parseInt(MockLinux.read(pin));
      return TestHelper.shouldEventuallyEqual(actual, expected);
    });
  });

  it('writes low', () => {
    const expected = 0;
    return gpio.write(expected).then(() => {
      const actual = parseInt(MockLinux.read(pin));
      return TestHelper.shouldEventuallyEqual(actual, expected);
    });
  });

  it('write fail',() => {
    const expected = 'EBADF';
    
    const valueFd = gpio._valueFd;
    gpio._valueFd = 1e6;

    return gpio.write(1)
      .catch((err) => {
        gpio._valueFd = valueFd;
        const actual = err.code;
        return TestHelper.shouldEventuallyEqual(actual, expected);
      });
  });

  afterEach(() => {
    gpio.unexport();
    MockLinux.restore();
  });
});

