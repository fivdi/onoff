import assert = require('assert');
import mockRequire = require('mock-require');
import MockLinux = require('./mocks/linux');
import MockEpoll = require('./mocks/epoll');

mockRequire('epoll', MockEpoll);
import { Gpio } from '../onoff';

describe('definition', () => {
    let gpio: Gpio;
    let pin: number;
  
    beforeEach(() => {
      pin = 4;
      MockLinux.gpio(pin);
    });
  
    it('fires rising', (done) => {
      gpio = new Gpio(pin, 'in', 'both');

      const expected = 1;
      gpio.watch((err, actual) => {
        assert.deepEqual(actual, expected);
        done();
      });
      MockLinux.write(pin, '' + expected);
    });

    afterEach(() => {
      gpio.unexport();
      MockLinux.restore();
    });
  });
