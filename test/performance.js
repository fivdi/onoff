var onoff = require('../onoff'),
    ledGpio = 17,
    count = 0,
    iv;

var loop = function () {
    onoff.value(ledGpio, 1, function (err) {
        if (err) throw err;
        onoff.value(ledGpio, 0, function () {
            if (err) throw err;
            count += 1;
            process.nextTick(function () {
                loop();
            });
        })
    });
};

onoff.exp(ledGpio, function(err) {
    if (err) throw err;
    onoff.direction(ledGpio, 'out', function (err) {
        if (err) throw err;
        loop();
    });
});

iv = setInterval(function () {
    console.log(count);
    count = 0;
}, 1000);

setTimeout(function () {
    clearInterval(iv);
    onoff.value(ledGpio, 0, function (err) {
        if (err) throw err;
        onoff.unexp(ledGpio, function() {
            if (err) throw err;
        });
    });
}, 5000);

