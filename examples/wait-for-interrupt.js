var onoff = require('../onoff'),
    buttonGpio = 18;

function watchButton() {
    console.log('Please press the button...');
    onoff.watch(buttonGpio, function (err, value) {
        console.log('Button pressed!');
        onoff.unexp(buttonGpio);
    });
};

onoff.exp(buttonGpio, function (err) {
    onoff.direction(buttonGpio, 'in', function (err) {
        onoff.edge(buttonGpio, 'both', function (err) {
            watchButton();
        });
    });
});

