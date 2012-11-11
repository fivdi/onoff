var Gpio = require('../onoff').Gpio, // Constructor function for Gpio objects.
    ledGpio = new Gpio(17, 'out');   // Export GPIO #17 as an output.

// Toggle the state of the LED on GPIO #17 every 200ms 'count' times.
// Here asynchronous methods are used. Synchronous methods are also available.
function blink(count) {
    if (count <= 0) return ledGpio.unexport();

    // Asynchronous read.
    ledGpio.read(function(err, value) {
        if (err) throw err;
        // Asynchronous write.
        ledGpio.write(value === 0 ? 1 : 0, function(err) {
            if (err) throw err;
        });
    });

    setTimeout(function() {
        blink(count -1);
    }, 200);
}

blink(20);

