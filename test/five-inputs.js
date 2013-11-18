var Gpio = require('../onoff').Gpio,
    pins = [18, 22, 23, 24, 27],
    buttons = [],
    presses = 0,
    i = 0;

function buttonPressed(err, value) {
    var j = 0;

    presses += 1;

    console.log('Button on GPIO #' + this.gpio + ' pressed. ' + presses + ' button presses so far.');

    if (presses === 10) {
        for (j = 0; j !== buttons.length; j += 1) {
            buttons[j].unexport();
        }
    }
}

for (i = 0; i !== pins.length; i += 1) {
    buttons[i] = new Gpio(pins[i], 'in', 'rising', {
        debounceTimeout : 250
    });

    buttons[i].watch(buttonPressed.bind(buttons[i]));
}

console.info('Please press buttons attached to GPIO #18, #22, #23, #24, or #27...');

