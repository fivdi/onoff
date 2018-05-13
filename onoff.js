"use strict";

const fs = require('fs');
const debounce = require('lodash.debounce');
const Epoll = require('epoll').Epoll;

const GPIO_ROOT_PATH = '/sys/class/gpio/';

// fs reads and writes use Buffers
const HIGH_BUF = Buffer.from('1');
const LOW_BUF = Buffer.from('0');

// lib returns numeric data and expects numeric data as arguments
const HIGH = 1;
const LOW = 0;

class Gpio {
  constructor(gpio, direction, edge, options) {
    if (typeof edge === 'object' && !options) {
      options = edge;
      edge = undefined;
    }

    options = options || {};

    this._gpio = gpio;
    this._gpioPath = GPIO_ROOT_PATH + 'gpio' + this._gpio + '/';
    this._debounceTimeout = options.debounceTimeout || 0;
    this._readBuffer = Buffer.alloc(16);
    this._listeners = [];

    if (!fs.existsSync(this._gpioPath)) {
      // The pin hasn't been exported yet so export it
      fs.writeFileSync(GPIO_ROOT_PATH + 'export', this._gpio);

      // A hack to avoid the issue described here:
      // https://github.com/raspberrypi/linux/issues/553
      // I don't like this solution, but it enables compatibility with older
      // versions of onoff, i.e., the Gpio constructor was and still is
      // synchronous.
      let permissionRequiredPaths = [
        this._gpioPath + 'direction',
        this._gpioPath + 'active_low',
        this._gpioPath + 'value',
      ];

      // On some systems the edge file will not exist if the GPIO does not
      // support interrupts
      // https://github.com/fivdi/onoff/issues/77#issuecomment-321980735
      if (edge && direction === 'in') {
        permissionRequiredPaths.push(this._gpioPath + 'edge');
      }

      permissionRequiredPaths.forEach((path) => {
        let tries = 0;

        while (true) {
          try {
            tries += 1;
            const fd = fs.openSync(path, 'r+');
            fs.closeSync(fd);
            break;
          } catch (e) {
            if (tries === 10000) {
              throw e;
            }
          }
        }
      });

      fs.writeFileSync(this._gpioPath + 'direction', direction);

      // On some systems writing to the edge file for an output GPIO will
      // result in an "EIO, i/o error"
      // https://github.com/fivdi/onoff/issues/87
      if (edge && direction === 'in') {
        fs.writeFileSync(this._gpioPath + 'edge', edge);
      }

      if (!!options.activeLow) {
        fs.writeFileSync(this._gpioPath + 'active_low', HIGH_BUF);
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
        fs.writeFileSync(this._gpioPath + 'direction', direction);
      } catch (ignore) {
      }
      try {
        // On some systems writing to the edge file for an output GPIO will
        // result in an "EIO, i/o error"
        // https://github.com/fivdi/onoff/issues/87
        if (edge && direction === 'in') {
          fs.writeFileSync(this._gpioPath + 'edge', edge);
        }
        try {
          fs.writeFileSync(this._gpioPath + 'active_low',
            !!options.activeLow ? HIGH_BUF : LOW_BUF
          );
        } catch (ignore) {
        }
      } catch (ignore) {
      }
    }

    // Cache fd for performance
    this._valueFd = fs.openSync(this._gpioPath + 'value', 'r+');

    {
      // A poller is created for both inputs and outputs. A poller isn't
      // actully needed for an output but the setDirection method can be
      // invoked to change the direction of a GPIO from output to input and
      // then a poller may be needed.
      const pollerEventHandler = (err, fd, events) => {
        const value = this.readSync();

        if ((value === LOW && this._fallingEnabled) ||
            (value === HIGH && this._risingEnabled)) {
          this._listeners.slice(0).forEach((callback) => {
            callback(err, value);
          });
        }
      };

      this._risingEnabled = edge === 'both' || edge == 'rising';
      this._fallingEnabled = edge === 'both' || edge == 'falling';

      // Read GPIO value before polling to prevent an initial unauthentic
      // interrupt
      this.readSync();

      if (this._debounceTimeout > 0) {
        const db = debounce(pollerEventHandler, this._debounceTimeout);

        this._poller = new Epoll((err, fd, events) => {
          this.readSync(); // Clear interrupt
          db(err, fd, events);
        });
      } else {
        this._poller = new Epoll(pollerEventHandler);
      }
    }
  }

  read(callback) {
    fs.read(this._valueFd, this._readBuffer, 0, 1, 0, (err, bytes, buf) => {
      if (typeof callback === 'function') {
        if (err) {
          return callback(err);
        }

        callback(null, buf[0] === HIGH_BUF[0] ? HIGH : LOW);
      }
    });
  }

  readSync() {
    fs.readSync(this._valueFd, this._readBuffer, 0, 1, 0);
    return this._readBuffer[0] === HIGH_BUF[0] ? HIGH : LOW;
  }

  write(value, callback) {
    const writeBuffer = value === HIGH ? HIGH_BUF : LOW_BUF;
    fs.write(this._valueFd, writeBuffer, 0, writeBuffer.length, 0, callback);
  }

  writeSync(value) {
    const writeBuffer = value === HIGH ? HIGH_BUF : LOW_BUF;
    fs.writeSync(this._valueFd, writeBuffer, 0, writeBuffer.length, 0);
  }

  watch(callback) {
    this._listeners.push(callback);

    if (this._listeners.length === 1) {
      this._poller.add(this._valueFd, Epoll.EPOLLPRI);
    }
  }

  unwatch(callback) {
    if (this._listeners.length > 0) {
      if (typeof callback !== 'function') {
        this._listeners = [];
      } else {
        this._listeners = this._listeners.filter((listener) => {
          return callback !== listener;
        });
      }

      if (this._listeners.length === 0) {
        this._poller.remove(this._valueFd);
      }
    }
  }

  unwatchAll() {
    this.unwatch();
  }

  direction() {
    return fs.readFileSync(this._gpioPath + 'direction').toString().trim();
  }

  setDirection(direction) {
    fs.writeFileSync(this._gpioPath + 'direction', direction);
  }

  edge() {
    return fs.readFileSync(this._gpioPath + 'edge').toString().trim();
  }

  setEdge(edge) {
    fs.writeFileSync(this._gpioPath + 'edge', edge);

    this._risingEnabled = edge === 'both' || edge == 'rising';
    this._fallingEnabled = edge === 'both' || edge == 'falling';
  }

  activeLow() {
    return fs.readFileSync(
      this._gpioPath + 'active_low')[0] === HIGH_BUF[0] ? true : false;
  }

  setActiveLow(invert) {
    fs.writeFileSync(this._gpioPath + 'active_low', !!invert ? HIGH_BUF : LOW_BUF);
  }

  unexport() {
    this.unwatchAll();
    fs.closeSync(this._valueFd);
    try {
      fs.writeFileSync(GPIO_ROOT_PATH + 'unexport', this._gpio);
    } catch (ignore) {
      // Flow of control always arrives here when cape_universal is enabled on
      // the bbb.
    }
  }

  static get accessible() {
    let fd;

    try {
      fd = fs.openSync(GPIO_ROOT_PATH + 'export', 'w');
    } catch(e) {
      // e.code === 'ENOENT' / 'EACCES' are most common
      // though any failure to open will also result in a gpio
      // failure to export.
      return false;
    } finally {
      if (fd) {
        fs.closeSync(fd);
      }
    }

    return true;
  }
}

Gpio.HIGH = HIGH;
Gpio.LOW = LOW;

exports.Gpio = Gpio;
