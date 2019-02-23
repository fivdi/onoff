'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const MockLinux = require('./mocks/linux');
const MockEpoll = require('./mocks/epoll');

mockRequire('epoll', MockEpoll);
const Gpio = require('../onoff').Gpio;


describe('constructor fails', function () {
  let pin;

  this.timeout(10000);

  beforeEach(() => {
    pin = 4;
  });


  it('fails to construct input while waiting for access permission', () => {
    const expected = 'ENOENT';
    let actual;

    MockLinux.gpioWithoutPinFiles();

    try {
      const gpio = new Gpio(pin, 'in', 'both');
    } catch (err) {
      actual = err.code;
    }

    assert.deepEqual(actual, expected);
  });

  it('fails to construct output while waiting for access permission', () => {
    const expected = 'ENOENT';
    let actual;

    MockLinux.gpioWithoutPinFiles();

    try {
      const gpio = new Gpio(pin, 'out');
    } catch (err) {
      actual = err.code;
    }

    assert.deepEqual(actual, expected);
  });


  afterEach(() => {
    MockLinux.restore();
  });
});

