var fs = require('fs'),
    Epoll = require('epoll').Epoll,
    gpioRootPath = '/sys/class/gpio/',
    zero = new Buffer('0'),
    one = new Buffer('1');

exports.version = '0.3.1';

/**
 * Constructor. Exports a GPIO to userspace.
 *
 * The constructor is written to function for both superusers and
 * non-superusers. See README.md for more details.
 *
 * gpio: number      // The Linux GPIO identifier; an unsigned integer.
 * direction: string // Specifies whether the GPIO should be configured as an
 *                   // input or output. The valid values are: 'in', 'out',
 *                   // 'high', and 'low'. 'high' and 'low' are variants of
 *                   // 'out' that configure the GPIO as an output with an
 *                   // initial level of high or low respectively.
 * [edge: string]    // The interrupt generating edge for the GPIO. Can be
 *                   // specified for GPIO inputs and outputs. The edge
 *                   // specified determine what watchers watch for. The valid
 *                   // values are: 'none', 'rising', 'falling' or 'both'.
 *                   // The default value is 'none'. [optional]
 * [options: object] // Additional options. [optional]
 *
 * The options argument supports the following:
 * debounceTimeout: number  // Can be used to software debounce a button or
 *                          // switch using a timeout. Specified in
 *                          // milliseconds. The default value is 0.
 */
function Gpio(gpio, direction, edge, options) {
    var valuePath;

    if (typeof edge === 'object' && !options) {
        options = edge;
        edge = undefined;
    }

    options = options || {};

    this.gpio = gpio;
    this.gpioPath = gpioRootPath + 'gpio' + this.gpio + '/';
    this.opts = {};
    this.opts.debounceTimeout = options.debounceTimeout || 0;
    this.readBuffer = new Buffer(16);
    this.listeners = [];

    valuePath = this.gpioPath + 'value';

    if (!fs.existsSync(this.gpioPath)) {
        // The pin hasn't been exported yet so export it.
        fs.writeFileSync(gpioRootPath + 'export', this.gpio);
        fs.writeFileSync(this.gpioPath + 'direction', direction);
        if (edge) {
            fs.writeFileSync(this.gpioPath + 'edge', edge);
        }

        // Allow all users to read and write the GPIO value file
        fs.chmodSync(valuePath, 0666);
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
        } catch (e) {
        }
        try {
            if (edge) {
                fs.writeFileSync(this.gpioPath + 'edge', edge);
            }
        } catch (e) {
        }
    }

    this.valueFd = fs.openSync(valuePath, 'r+'); // Cache fd for performance.

    // Read current value before polling to prevent unauthentic interrupts.
    this.readSync();

    this.poller = new Epoll(pollerEventHandler.bind(this));
}
exports.Gpio = Gpio;

/**
 * Read GPIO value asynchronously.
 *
 * [callback: (err: error, value: number) => {}] // Optional callback
 */
Gpio.prototype.read = function(callback) {
    fs.read(this.valueFd, this.readBuffer, 0, 1, 0, function(err, bytes, buf) {
        if (typeof callback === 'function') {
            if (err) return callback(err);
            callback(null, buf[0] === one[0] ? 1 : 0);
        }
    });
};

/**
 * Read GPIO value synchronously.
 *
 * Returns - number // 0 or 1
 */
Gpio.prototype.readSync = function() {
    fs.readSync(this.valueFd, this.readBuffer, 0, 1, 0);
    return this.readBuffer[0] === one[0] ? 1 : 0;
};

/**
 * Write GPIO value asynchronously.
 *
 * value: number                  // 0 or 1
 * [callback: (err: error) => {}] // Optional callback
 */
Gpio.prototype.write = function(value, callback) {
    var writeBuffer = value === 1 ? one : zero;
    fs.write(this.valueFd, writeBuffer, 0, writeBuffer.length, 0, callback);
};

/**
 * Write GPIO value synchronously.
 *
 * value: number // 0 or 1
 */
Gpio.prototype.writeSync = function(value) {
    var writeBuffer = value === 1 ? one : zero;
    fs.writeSync(this.valueFd, writeBuffer, 0, writeBuffer.length, 0);
};

/**
 * Watch for hardware interrupts on the GPIO. Inputs and outputs can be
 * watched. The edge argument that was passed to the constructor determines
 * which hardware interrupts are watcher for.
 *
 * Note that the value passed to the callback does not represent the value of
 * the GPIO the instant the interrupt occured, it represents the value of the
 * GPIO the instant the GPIO value file is read which may be several
 * milliseconds after the actual interrupt. By the time the GPIO value is read
 * the value may have changed. There are scenarios where this is likely to
 * occur, for example, with buttons or switches that are not hadrware
 * debounced.
 *
 * callback: (err: error, value: number) => {}
 */
Gpio.prototype.watch = function(callback) {
    var events;

    this.listeners.push(callback);

    if (this.listeners.length === 1) {
        events = Epoll.EPOLLPRI;
        if (this.opts.debounceTimeout > 0) {
            events |= Epoll.EPOLLONESHOT;
        }
        this.poller.add(this.valueFd, events);
    }
};

/**
 * Stop watching for hardware interrupts on the GPIO.
 */
Gpio.prototype.unwatch = function(callback) {
    if (this.listeners.length > 0) {
        if (typeof callback !== 'function') {
            this.listeners = [];
        } else {
            this.listeners = this.listeners.filter(function (listener) {
                return callback !== listener;
            });
        }

        if (this.listeners.length === 0) {
            this.poller.remove(this.valueFd);
        }
    }
};

/**
 * Remove all watchers for the GPIO.
 */
Gpio.prototype.unwatchAll = function() {
    this.unwatch();
};

function pollerEventHandler(err, fd, events) {
    var value = this.readSync(),
        callbacks = this.listeners.slice(0);

    if (this.opts.debounceTimeout > 0) {
        setTimeout(function () {
            if (this.listeners.length > 0) {
                // Read current value before polling to prevent unauthentic interrupts.
                this.readSync();
                this.poller.modify(this.valueFd, Epoll.EPOLLPRI | Epoll.EPOLLONESHOT);
            }
        }.bind(this), this.opts.debounceTimeout);
    }

    callbacks.forEach(function (callback) {
        callback(err, value);
    });
}

/**
 * Get GPIO direction.
 *
 * Returns - string // 'in', or 'out'
 */
Gpio.prototype.direction = function() {
    return fs.readFileSync(this.gpioPath + 'direction').toString().trim();
};

/**
 * Set GPIO direction.
 *
 * direction: string // Specifies whether the GPIO should be configured as an
 *                   // input or output. The valid values are: 'in', 'out',
 *                   // 'high', and 'low'. 'high' and 'low' are variants of
 *                   // 'out' that configure the GPIO as an output with an
 *                   // initial level of high or low respectively.
 */
Gpio.prototype.setDirection = function(direction) {
    fs.writeFileSync(this.gpioPath + 'direction', direction);
};

/**
 * Get GPIO interrupt generating edge.
 *
 * Returns - string // 'none', 'rising', 'falling' or 'both'
 */
Gpio.prototype.edge = function() {
    return fs.readFileSync(this.gpioPath + 'edge').toString().trim();
};

/**
 * Set GPIO interrupt generating edge.
 *
 * edge: string // The interrupt generating edge for the GPIO. Can be
 *              // specified for GPIO inputs and outputs. The edge
 *              // specified determine what watchers watch for. The valid
 *              // values are: 'none', 'rising', 'falling' or 'both'.
 *              // The default value is 'none'. [optional]
 */
Gpio.prototype.setEdge = function(edge) {
    fs.writeFileSync(this.gpioPath + 'edge', edge);
};

/**
 * Get GPIO options.
 *
 * Returns - object // Must not be modified
 */
Gpio.prototype.options = function() {
    return this.opts;
};

/**
 * Reverse the effect of exporting the GPIO to userspace. The Gpio object
 * should not be used after calling this method.
 */
Gpio.prototype.unexport = function(callback) {
    this.unwatchAll();
    fs.closeSync(this.valueFd);
    fs.writeFileSync(gpioRootPath + 'unexport', this.gpio);
};

