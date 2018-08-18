'use strict';

const assert = require('assert');
const MockLinux = require('./mocks/linux');
const mockRequire = require('mock-require');
const MockEpoll = require('./mocks/epoll');

mockRequire('epoll', MockEpoll);
const Gpio = require('../onoff').Gpio;


describe('writing', () => {
  let gpio;

  beforeEach(() => {
    MockLinux.gpio(4);
    gpio = new Gpio(4, 'in');
  });

  describe('write', () => {

    it('success', (done) => {
      const actual = 1;
      gpio.write(actual, (error) => {
        const computed = MockLinux.read(4);
        assert.deepEqual(actual, computed);
        done();
      });
    });

  });

  describe('writeSync', () => {

    it('success', () => {
      const actual = 1;
      gpio.writeSync(actual);
      const computed = MockLinux.read(4);
      assert.deepEqual(actual, computed);
    });

  });

  afterEach(() => {
    gpio.unexport();
    MockLinux.restore();
  });
});
