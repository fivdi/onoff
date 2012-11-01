var fs = require('fs'),
    gpioWatcher = require('./build/Release/gpiowatcher'),
    gpioPath = '/sys/class/gpio/';

/**
 * Export a GPIO to userspace.
 *
 * Example - Export GPIO 17:
 *
 * onoff.exp(17, function (err) {
 *     if (err) throw err;
 *     console.log('GPIO 17 has been exported to userspace.');
 * });
 *
 * gpio: number
 * [callback: (err: error) => {}]
 */
exports.exp = function (gpio, callback) {
    fs.writeFile(gpioPath + 'export', gpio, callback);
};

/**
 * Reverse the effect of exporting a GPIO to userspace.
 *
 * gpio: number
 * [callback: (err: error) => {}]
 */
exports.unexp = function (gpio, callback) {
    fs.writeFile(gpioPath + 'unexport', gpio, callback);
};

/**
 * Get or set the direction of a GPIO.
 *
 * Example - Get direction of GPIO 17:
 *
 * onoff.direction(17, function (err, direction) {
 *     if (err) throw err;
 *     console.log('GPIO 17 has direction ' + direction);
 * });
 *
 * Example - Set direction of gpio 17 to 'out':
 *
 * onoff.direction(17, 'out', function (err) {
 *     if (err) throw err;
 *     console.log('GPIO 17 is an output.');
 * });
 *
 * Get
 * gpio: number
 * [callback: (err: error, direction: string) => {}]
 *
 * Set
 * gpio: number
 * direction: string // 'in' or 'out'
 * [callback: (err: error) => {}]
 */
exports.direction = function(gpio, direction, callback) {
    rwGpioFile(gpio, 'direction', direction, callback);
};

/**
 * Get or set the value of a GPIO.
 *
 * Get
 * gpio: number
 * [callback: (err: error, value: number) => {}]
 *
 * Set
 * gpio: number
 * value: number // 0 or 1.
 * [callback: (err: error) => {}]
 */
exports.value = function (gpio, value, callback) {
    rwGpioFile(gpio, 'value', value, callback);
};

/**
 * Get or set the interrupt generating edge of a GPIO.
 *
 * Get
 * gpio: number
 * [callback: (err: error, edge: string) => {}]
 *
 * Set
 * gpio: number
 * edge: string // 'none', 'rising', 'falling' or 'both'.
 * [callback: (err: error) => {}]
 */
exports.edge = function (gpio, edge, callback) {
    rwGpioFile(gpio, 'edge', edge, callback);
};

/**
 * Watch and wait for a GPIO to interrupt in a separate worker thread.
 *
 * gpio: number
 * callback: (err: error, value: number) => {}
 */
exports.watch = gpioWatcher.watch;

/**
 * Convenience function for exporting a GPIO to userspace and setting its
 * direction and edge.
 *
 * gpio: number
 * direction: string // 'in' or 'out'
 * [edge: string] // 'none', 'rising', 'falling' or 'both'.
 * [callback: (err: error) => {}]
 */
exports.configure = function (gpio, direction, edge, callback) {
    var cb = arguments[arguments.length - 1];

    callback = (typeof cb === 'function' ? cb : function () {});
    edge = (typeof edge === 'string' ? edge : undefined);

    exports.exp(gpio, function (err) {
        if (err) return callback(err);
        exports.direction(gpio, direction, function (err) {
            if (err) return callback(err);
            if (edge) {
                exports.edge(gpio, edge, callback);
            } else {
                callback(null);
            }
        });
    });
};

/**
 * Read or write the contents of a GPIO file.
 *
 * Read
 * gpio: number
 * filename: string // 'direction', 'value', or 'edge'
 * [callback: (err: error, data: string or number) => {}]
 *
 * Write
 * gpio: number
 * filename: string // 'direction', 'value', or 'edge'
 * value: string
 * [callback: (err: error) => {}]
 */
var rwGpioFile = function (gpio, filename, value, callback) {
    var gpioFilename = gpioPath + 'gpio' + gpio + '/' + filename;

    if (typeof value === 'function' && !callback) {
        callback = value;
        value = undefined;
    }

    if (value === undefined) {
        fs.readFile(gpioFilename, function (err, data) {
            if (!err) {
                data = data.toString().replace(/\n/, ''); // Strip newline.
                if (filename === 'value') {
                    data = parseInt(data, 2);
                }
            }
            callback(err, data);
        });
    } else {
        fs.writeFile(gpioFilename, value, callback);
    }
};


