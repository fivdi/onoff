var fs = require('fs'),
    gpioWatcher = require('./build/Release/gpiowatcher'),
    gpioRootPath = '/sys/class/gpio/',
    zero = new Buffer('0'),
    one = new Buffer('1');

exports.version = '0.1.0';

/**
 * Constructor. Exports a GPIO to userspace, sets its direction, and optionally
 * its interrupting edge.
 *
 * The constructor is written to function for both superusers and
 * non-superusers. See README.md for more details.
 *
 * gpio: number      // The Linux GPIO identifier; an unsigned integer
 * direction: string // 'in', 'out', 'high', or 'low'
 * [edge: string]    // 'none', 'rising', 'falling' or 'both' [optional]
 */
function Gpio(gpio, direction, edge) {
    var valuePath;

    this.gpio = gpio;
    this.gpioPath = gpioRootPath + 'gpio' + this.gpio + '/';
    this.readBuffer = new Buffer(16);

    valuePath = this.gpioPath + 'value';

    if (!fs.existsSync(this.gpioPath)) {
        fs.writeFileSync(gpioRootPath + 'export', this.gpio);
        fs.writeFileSync(this.gpioPath + 'direction', direction);
        if (edge) {
            fs.writeFileSync(this.gpioPath + 'edge', edge);
        }

        // Allow all users to read and write the GPIO value file
        fs.chmodSync(valuePath, 0666);
    }

    this.valueFd = fs.openSync(valuePath, 'r+');
}
exports.Gpio = Gpio;

/**
 * Read GPIO value asynchronously.
 *
 * [callback: (err: error, value: number) => {}]
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
 * value: number                  // 0 or 1.
 * [callback: (err: error) => {}] // optional callback
 */
Gpio.prototype.write = function(value, callback) {
    var writeBuffer = value === 1 ? one : zero;
    fs.write(this.valueFd, writeBuffer, 0, writeBuffer.length, 0, callback);
};

/**
 * Write GPIO value synchronously.
 *
 * value: number // 0 or 1.
 */
Gpio.prototype.writeSync = function(value) {
    // Replacing a with b made ./test/performance-sync.js 3.5 times faster.
    // var writeBuffer = new Buffer(value.toString()); // a
    var writeBuffer = value === 1 ? one : zero;        // b
    fs.writeSync(this.valueFd, writeBuffer, 0, writeBuffer.length, 0);
};

/**
 * Watch and wait for GPIO to interrupt.
 *
 * callback: (err: error, value: number) => {}
 */
Gpio.prototype.watch = function(callback) {
    gpioWatcher.watch(this.gpio, callback);
};

/**
 * Read GPIO direction.
 *
 * Returns - string // 'in', 'out'
 */
Gpio.prototype.direction = function() {
    return fs.readFileSync(this.gpioPath + 'direction').toString().trim();
};

/**
 * Read GPIO interrupt generating edge.
 *
 * Returns - string // 'none', 'rising', 'falling' or 'both'
 */
Gpio.prototype.edge = function() {
    return fs.readFileSync(this.gpioPath + 'edge').toString().trim();
};

/**
 * Reverse the effect of exporting the GPIO to userspace. The Gpio object
 * should not be used after calling this method.
 */
Gpio.prototype.unexport = function(callback) {
    fs.closeSync(this.valueFd);
    fs.writeFileSync(gpioRootPath + 'unexport', this.gpio);
};

