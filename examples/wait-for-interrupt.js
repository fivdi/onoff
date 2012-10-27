var onoff = require('../onoff'),
    buttonGpio = 18;

onoff.configure(buttonGpio, 'in', 'both', function (err) {
    if (err) throw err;
    console.log('Please press the button on GPIO 18...');
    onoff.watch(buttonGpio, function (err, value) {
        if (err) throw err;
        console.log('Button pressed!, its value was ' + value);
        onoff.unexp(buttonGpio);
    });
});

