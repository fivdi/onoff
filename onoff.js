"use strict";

const fs = require('fs');
const debounce = require('lodash.debounce');
const Epoll = require('epoll').Epoll;

const GPIO_ROOT_PATH = '/sys/class/gpio/';
const ZERO = new Buffer('0');
const ONE = new Buffer('1');

class Gpio {
  constructor(gpio, direction, edge, options) {
    if (typeof edge === 'object' && !options) {
      options = edge;
      edge = undefined;
    }

    options = options || {};

    this.gpio = gpio;
    this.gpioPath = GPIO_ROOT_PATH + 'gpio' + this.gpio + '/';
    this.opts = {};
    this.opts.debounceTimeout = options.debounceTimeout || 0;
    this.readBuffer = new Buffer(16);
    this.listeners = [];

    if (!fs.existsSync(this.gpioPath)) {
      // The pin hasn't been exported yet so export it.
      fs.writeFileSync(GPIO_ROOT_PATH + 'export', this.gpio);

      // A hack to avoid the issue described here:
      // https://github.com/raspberrypi/linux/issues/553
      // I don't like this solution, but it enables compatibility with older
      // versions of onoff, i.e., the Gpio constructor was and still is
      // synchronous.
      let permissionRequiredPaths = [
        this.gpioPath + 'direction',
        this.gpioPath + 'active_low',
        this.gpioPath + 'value',
      ];

      if (edge && direction === 'in') {
        permissionRequiredPaths.push(this.gpioPath + 'edge');
      }

      permissionRequiredPaths.forEach((path) => {
        let tries = 0;
        let fd;

        while (true) {
          try {
            tries += 1;
            fd = fs.openSync(path, 'r+');
            fs.closeSync(fd);
            break;
          } catch (e) {
            if (tries === 10000) {
              throw e;
            }
          }
        }
      });

      fs.writeFileSync(this.gpioPath + 'direction', direction);

      if (edge && direction === 'in') {
        fs.writeFileSync(this.gpioPath + 'edge', edge);
      }

      if (!!options.activeLow) {
        fs.writeFileSync(this.gpioPath + 'active_low', ONE);
      }
    } else {
      // The pin has already been exported, perhaps by onoff itself, perhaps
      // by quick2wire gpio-admin on the Pi, perhaps by the WiringPi gpio
      // utility on the Pi, or perhaps by something else. In any case, an
      // attempt is made to set the direction and edge to the requested
      // values here. If quick2wire gpio-admin was used for the export, the
      // user should have access to both direction and edge files. This is
      // important as gpio-admin sets niether direction nor edge. If the
      // WiringPi gpio utility was used, the user should have access to edge
      // file, but not the direction file. This is also ok as the WiringPi
      // gpio utility can set both direction and edge. If there are any
      // errors while attempting to perform the modifications, just keep on
      // truckin'.
      try {
        fs.writeFileSync(this.gpioPath + 'direction', direction);
      } catch (ignore) {
      }
      try {
        if (edge && direction === 'in') {
          fs.writeFileSync(this.gpioPath + 'edge', edge);
        }
        try {
          fs.writeFileSync(this.gpioPath + 'active_low',
            !!options.activeLow ? ONE : ZERO
          );
        } catch (ignore) {
        }
      } catch (ignore) {
      }
    }

    // Cache fd for performance.
    this.valueFd = fs.openSync(this.gpioPath + 'value', 'r+');

    if (edge && direction === 'in') {
      const pollerEventHandler = (err, fd, events) => {
        const value = this.readSync();

        if ((value === 0 && this.fallingEnabled) ||
            (value === 1 && this.risingEnabled)) {
          this.listeners.slice(0).forEach((callback) => {
            callback(err, value);
          });
        }
      };

      this.risingEnabled = edge === 'both' || edge == 'rising';
      this.fallingEnabled = edge === 'both' || edge == 'falling';

      // Read GPIO value before polling to prevent unauthentic interrupts.
      this.readSync();

      if (this.opts.debounceTimeout > 0) {
        const db = debounce(pollerEventHandler, this.opts.debounceTimeout);

        this.poller = new Epoll((err, fd, events) => {
          this.readSync(); // Clear interrupt.
          db(err, fd, events);
        });
      } else {
        this.poller = new Epoll(pollerEventHandler);
      }
    }
  }

  read(callback) {
    fs.read(this.valueFd, this.readBuffer, 0, 1, 0, (err, bytes, buf) => {
      if (typeof callback === 'function') {
        if (err) {
          return callback(err);
        }

        callback(null, buf[0] === ONE[0] ? 1 : 0);
      }
    });
  }

  readSync() {
    fs.readSync(this.valueFd, this.readBuffer, 0, 1, 0);
    return this.readBuffer[0] === ONE[0] ? 1 : 0;
  }

  write(value, callback) {
    const writeBuffer = value === 1 ? ONE : ZERO;
    fs.write(this.valueFd, writeBuffer, 0, writeBuffer.length, 0, callback);
  }

  writeSync(value) {
    const writeBuffer = value === 1 ? ONE : ZERO;
    fs.writeSync(this.valueFd, writeBuffer, 0, writeBuffer.length, 0);
  }

  watch(callback) {
    this.listeners.push(callback);

    if (this.listeners.length === 1) {
      this.poller.add(this.valueFd, Epoll.EPOLLPRI);
    }
  }

  unwatch(callback) {
    if (this.listeners.length > 0) {
      if (typeof callback !== 'function') {
        this.listeners = [];
      } else {
        this.listeners = this.listeners.filter((listener) => {
          return callback !== listener;
        });
      }

      if (this.listeners.length === 0) {
        this.poller.remove(this.valueFd);
      }
    }
  }

  unwatchAll() {
    this.unwatch();
  }

  direction() {
    return fs.readFileSync(this.gpioPath + 'direction').toString().trim();
  }

  setDirection(direction) {
    fs.writeFileSync(this.gpioPath + 'direction', direction);
  }

  edge() {
    return fs.readFileSync(this.gpioPath + 'edge').toString().trim();
  }

  setEdge(edge) {
    fs.writeFileSync(this.gpioPath + 'edge', edge);
  }

  activeLow() {
    return fs.readFileSync(
      this.gpioPath + 'active_low')[0] === ONE[0] ? true : false;
  }

  setActiveLow(invert) {
    fs.writeFileSync(this.gpioPath + 'active_low', !!invert ? ONE : ZERO);
  }

  options() {
    return this.opts;
  }

  unexport() {
    this.unwatchAll();
    fs.closeSync(this.valueFd);
    try {
      fs.writeFileSync(GPIO_ROOT_PATH + 'unexport', this.gpio);
    } catch (ignore) {
      // Flow of control always arrives here when cape_universal is enabled on
      // the bbb.
    }
  }
}

exports.Gpio = Gpio;

