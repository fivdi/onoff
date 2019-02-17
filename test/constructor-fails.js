'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const MockLinux = require('./mocks/linux');
const MockEpoll = require('./mocks/epoll');

mockRequire('epoll', MockEpoll);
const Gpio = require('../onoff').Gpio;


describe('constructor fails', () => {
  let pin;

  beforeEach(() => {
    pin = 4;
  });


  it('fails to construct', () => {
    MockLinux.makeGpioAccessible();
  
    const expected = 'ENOENT';
    let actual;

    try {
      const gpio = new Gpio(pin, 'in', 'both');
    } catch (err) {
      actual = err.code;
    }

    assert.deepEqual(actual, expected);
  });


  afterEach(() => {
    MockLinux.restore();
  });
});

