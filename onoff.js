'use strict';

const fs = require('fs');
const debounce = require('lodash.debounce');
const Epoll = require('epoll').Epoll;

const GPIO_ROOT_PATH = '/sys/class/gpio/';

const HIGH_BUF = Buffer.from('1');
const LOW_BUF = Buffer.from('0');

const HIGH = 1;
const LOW = 0;

const exportGpio = gpio => {
  if (!fs.existsSync(gpio._gpioPath)) {
    // The GPIO hasn't been exported yet so export it
    fs.writeFileSync(GPIO_ROOT_PATH + 'export', gpio._gpio);

    return false;
  }

  // The GPIO has already been exported, perhaps by onoff itself, perhaps
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
  return true;
};

// Avoid the access permission issue described here:
// https://github.com/raspberrypi/linux/issues/553
// On some syetems udev rules are used to set access permissions on the GPIO
// sysfs files enabling those files to be accessed without root privileges.
// This takes a while so wait for it to complete.
const waitForGpioAccessPermission = (
  gpio, direction, edge, gpioPreviouslyExported
) => {
  let permissionRequiredPaths = [
    gpio._gpioPath + 'value',
  ];

  if (gpioPreviouslyExported === false) {
    permissionRequiredPaths.push(gpio._gpioPath + 'direction');
    permissionRequiredPaths.push(gpio._gpioPath + 'active_low');

    // On some systems the edge file will not exist if the GPIO does not
    // support interrupts
    // https://github.com/fivdi/onoff/issues/77#issuecomment-321980735
    if (edge && direction === 'in') {
      permissionRequiredPaths.push(gpio._gpioPath + 'edge');
    }
  }

  permissionRequiredPaths.forEach(path => {
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
};

const configureGpio = (
  gpio, direction, edge, options, gpioPreviouslyExported
) => {
  const throwIfNeeded = err => {
    if (gpioPreviouslyExported === false) {
      throw err;
    }
  };

  try {
    if (typeof options.activeLow === 'boolean') {
      gpio.setActiveLow(options.activeLow);
    }
  } catch (err) {
    throwIfNeeded(err);
  }

  try {
    const reconfigureDirection =
      typeof options.reconfigureDirection === 'boolean' ?
        options.reconfigureDirection : true;

    const requestedDirection =
      direction === 'high' || direction === 'low' ? 'out' : direction;

    if (reconfigureDirection || gpio.direction() !== requestedDirection) {
      gpio.setDirection(direction);
    }
  } catch (err) {
    throwIfNeeded(err);
  }

  try {
    // On some systems writing to the edge file for an output GPIO will
    // result in an "EIO, i/o error"
    // https://github.com/fivdi/onoff/issues/87
    if (edge && direction === 'in') {
      gpio.setEdge(edge);
    }
  } catch (err) {
    throwIfNeeded(err);
  }
};

const configureInterruptHandler = gpio => {
  // A poller is created for both inputs and outputs. A poller isn't
  // actually needed for an output but the setDirection method can be
  // invoked to change the direction of a GPIO from output to input and
  // then a poller may be needed.
  const pollerEventHandler = (err, fd, events) => {
    const value = gpio.readSync();

    if ((value === LOW && gpio._fallingEnabled) ||
        (value === HIGH && gpio._risingEnabled)) {
      gpio._listeners.slice(0).forEach(callback => {
        callback(err, value);
      });
    }
  };

  // Read GPIO value before polling to prevent an initial unauthentic
  // interrupt
  gpio.readSync();

  if (gpio._debounceTimeout > 0) {
    const db = debounce(pollerEventHandler, gpio._debounceTimeout);

    gpio._poller = new Epoll((err, fd, events) => {
      gpio.readSync(); // Clear interrupt
      db(err, fd, events);
    });
  } else {
    gpio._poller = new Epoll(pollerEventHandler);
  }
};

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
    this._readSyncBuffer = Buffer.alloc(16);
    this._listeners = [];

    const gpioPreviouslyExported = exportGpio(this);

    waitForGpioAccessPermission(
      this, direction, edge, gpioPreviouslyExported
    );

    configureGpio(this, direction, edge, options, gpioPreviouslyExported);

    this._valueFd = fs.openSync(this._gpioPath + 'value', 'r+');

    configureInterruptHandler(this);
  }

  read(callback) {
    const readValue = callback => {
      fs.read(this._valueFd, this._readBuffer, 0, 1, 0, (err, bytes, buf) => {
        if (typeof callback === 'function') {
          if (err) {
            return callback(err);
          }

          callback(null, convertBufferToBit(buf));
        }
      });
    };

    if (callback) {
      readValue(callback);
    } else {
      return new Promise((resolve, reject) => {
        readValue((err, value) => {
          if (err) {
            reject(err);
          } else {
            resolve(value);
          }
        });
      });
    }
  }

  readSync() {
    fs.readSync(this._valueFd, this._readSyncBuffer, 0, 1, 0);
    return convertBufferToBit(this._readSyncBuffer);
  }

  write(value, callback) {
    const writeValue = (value, callback) => {
      const writeBuffer = convertBitToBuffer(value);
      fs.write(
        this._valueFd, writeBuffer, 0, writeBuffer.length, 0, callback
      );
    };

    if (callback) {
      writeValue(value, callback);
    } else {
      return new Promise((resolve, reject) => {
        writeValue(value, err => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
  }

  writeSync(value) {
    const writeBuffer = convertBitToBuffer(value);
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
        this._listeners = this._listeners.filter(listener => {
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

    this._risingEnabled = edge === 'both' || edge === 'rising';
    this._fallingEnabled = edge === 'both' || edge === 'falling';
  }

  activeLow() {
    return convertBufferToBoolean(
      fs.readFileSync(this._gpioPath + 'active_low')
    );
  }

  setActiveLow(invert) {
    fs.writeFileSync(
      this._gpioPath + 'active_low', convertBooleanToBuffer(!!invert)
    );
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
      fd = fs.openSync(GPIO_ROOT_PATH + 'export', 'r+');
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

const convertBitToBuffer = bit => convertBooleanToBuffer(bit === HIGH);
const convertBufferToBit =
  buffer => convertBufferToBoolean(buffer) ? HIGH : LOW;

const convertBooleanToBuffer = boolean => boolean ? HIGH_BUF : LOW_BUF;
const convertBufferToBoolean = buffer => buffer[0] === HIGH_BUF[0];

Gpio.HIGH = HIGH;
Gpio.LOW = LOW;

module.exports.Gpio = Gpio;

