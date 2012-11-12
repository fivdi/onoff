var Gpio = require('../onoff').Gpio,  // Constructor function for Gpio objects.
    button = new Gpio(18, 'in', 'both'); // Export GPIO #18 as an interrupt
                                         // generating input.

console.log('Please press the button on GPIO #18...');

// The callback passed to watch will be called when the button on GPIO #18 is
// pressed. 
button.watch(function (err, value) {
    if (err) throw err;

    console.log('Button pressed!, its value was ' + value);

    button.unexport(); // Unexport GPIO and free resources
});

