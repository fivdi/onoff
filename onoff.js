var fs = require('fs'),
    pinWatcher = require('./build/Release/pinwatcher'),
    gpioPath = '/sys/class/gpio/';

/**
 * Export a GPIO to userspace.
 *
 * Example - Export pin 17:
 *
 * onoff.exp(17, function (err) {
 *     if (err) throw err;
 *     console.log('Pin 17 has been exported to userspace.');
 * });
 *
 * pin: number
 * [callback: (err: error) => {}]
 */
exports.exp = function(pin, callback) {
    fs.writeFile(gpioPath + 'export', pin, callback);
};

/**
 * Reverse the effect of exporting a GPIO to userspace.
 *
 * pin: number
 * [callback: (err: error) => {}]
 */
exports.unexp = function(pin, callback) {
    fs.writeFile(gpioPath + 'unexport', pin, callback);
};

/**
 * Get or set the direction of a GPIO.
 *
 * Example - Get direction of pin 17:
 *
 * onoff.direction(17, function (err, direction) {
 *     if (err) throw err;
 *     console.log('Pin 17 is an ' + direction + ' pin.');
 * });
 *
 * Example - Set direction of pin 17 to 'out':
 *
 * onoff.direction(17, 'out', function (err) {
 *     if (err) throw err;
 *     console.log('Pin 17 is an output pin.');
 * });
 *
 * Get
 * pin: number
 * [callback: (err: error, direction: string) => {}]
 *
 * Set
 * pin: number
 * direction: string // 'in' or 'out'
 * [callback: (err: error) => {}]
 */
exports.direction = function(pin, direction, callback) {
    rwPinFile(pin, 'direction', direction, callback);
};

/**
 * Get or set the value of a GPIO.
 *
 * Get
 * pin: number
 * [callback: (err: error, value: number) => {}]
 *
 * Set
 * pin: number
 * value: number // 0 or 1.
 * [callback: (err: error) => {}]
 */
exports.value = function(pin, value, callback) {
    rwPinFile(pin, 'value', value, callback);
};

/**
 * Get or set the interrupt generating edge of a GPIO.
 *
 * Get
 * pin: number
 * [callback: (err: error, edge: string) => {}]
 *
 * Set
 * pin: number
 * edge: string // 'none', 'rising', 'falling' or 'both'.
 * [callback: (err: error) => {}]
 */
exports.edge = function(pin, edge, callback) {
    rwPinFile(pin, 'edge', edge, callback);
};

/**
 * Watch and wait for a GPIO to interrupt in a separate worker thread.
 *
 * pin: number
 * callback: (err: error, value: number) => {}
 */
exports.watch = pinWatcher.watch;

/**
 * Read or write the contents of a GPIO file for a specific pin.
 *
 * Read
 * pin: number
 * filename: string // 'direction', 'value', or 'edge'
 * [callback: (err: error, data: string or number) => {}]
 *
 * Write
 * pin: number
 * filename: string // 'direction', 'value', or 'edge'
 * value: string
 * [callback: (err: error) => {}]
 */
var rwPinFile = function(pin, filename, value, callback) {
    var pinFilename = gpioPath + 'gpio' + pin + '/' + filename;

    if (typeof value === 'function' && !callback) {
        callback = value;
        value = undefined;
    }

    if (value === undefined) {
        fs.readFile(pinFilename, function (err, data) {
            if (!err) {
                data = data.toString().replace(/\n/, ''); // Strip newline.
                if (filename === 'value') {
                    data = parseInt(data, 2);
                }
            }
            callback(err, data);
        });
    } else {
        fs.writeFile(pinFilename, value, callback);
    }
};

// Consider adding the following features:
// - Replace the word pin with the word gpio everywhere.
// - unwatch.
// - Snyc versions of all functions. Probably not.
// - GPIO objects. Among other things, GPIO objects could hold file
//   descriptors for the GPIO value file to improve performance.
// - making the callback parameter to watch optional

