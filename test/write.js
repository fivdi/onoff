'use strict';

const assert = require('assert');
const MockLinux = require('./mocks/linux');
const mockRequire = require('mock-require');
const MockEpoll = require('./mocks/epoll');

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

  it('writes high witout callback', (done) => {
    const expected = 1;
    gpio.write(expected);
    setTimeout(() => {
      const actual = MockLinux.read(pin);
      assert.deepEqual(actual, expected);
      done();
    }, 20);
  });

  it('writes low witout callback', (done) => {
    const expected = 0;
    gpio.write(expected);
    setTimeout(() => {
      const actual = MockLinux.read(pin);
      assert.deepEqual(actual, expected);
      done();
    }, 20);
  });


  afterEach(() => {
    gpio.unexport();
    MockLinux.restore();
  });
});

