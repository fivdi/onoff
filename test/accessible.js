'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const MockLinux = require('./mocks/linux');
const MockEpoll = require('./mocks/epoll');

mockRequire('epoll', MockEpoll);
const Gpio = require('../onoff').Gpio;


describe('accessible', () => {
  beforeEach(() => {
  });


  it('is accessible', () => {
    MockLinux.makeGpioAccessible();
    assert.deepEqual(Gpio.accessible, true);
  });

  it('is inaccessible', () => {
    MockLinux.makeGpioInaccessible();
    assert.deepEqual(Gpio.accessible, false);
  });


  afterEach(() => {
    MockLinux.restore();
  });
});

