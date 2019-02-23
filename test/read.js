'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const MockLinux = require('./mocks/linux');
const MockEpoll = require('./mocks/epoll');

mockRequire('epoll', MockEpoll);
const Gpio = require('../onoff').Gpio;


describe('read', () => {
  let gpio;
  let pin;

  beforeEach(() => {
    pin = 4;
    MockLinux.gpio(pin);
    gpio = new Gpio(pin, 'in');
  });


  it('reads high', (done) => {
    const expected = 1;
    MockLinux.write(pin, expected);
    gpio.read((err, actual) => {
      assert.deepEqual(actual, expected);
      done();
    });
  });

  it('reads low', (done) => {
    const expected = 0;
    MockLinux.write(pin, expected);
    gpio.read((err, actual) => {
      assert.deepEqual(actual, expected);
      done();
    });
  });

  it('reads without callback', (done) => {
    gpio.read();
    setTimeout(() => {
      done();
    }, 20);
  });

  it('fails', (done) => {
    const expected = 'EBADF';

    const valueFd = gpio._valueFd;
    gpio._valueFd = 1e6;

    gpio.read((err, value) => {
      gpio._valueFd = valueFd;

      const actual = err.code;
      assert.deepEqual(actual, expected);

      done();
    });
  });


  afterEach(() => {
    gpio.unexport();
    MockLinux.restore();
  });
});

