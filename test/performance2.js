var onoff = require('../onoff'),
    ledGpio,
    count = 0,
    iv;

var loop = function () {
    ledGpio.value(1, function (err) {
        if (err) throw err;
        ledGpio.value(0, function () {
            if (err) throw err;
            count += 1;
            process.nextTick(function () {
                loop();
            });
        })
    });
};

onoff.open(17, 'out', function (err, gpio) {
    if (err) throw err;
    ledGpio = gpio;
    loop();
});

iv = setInterval(function () {
    console.log(count);
    count = 0;
}, 1000);

setTimeout(function () {
    clearInterval(iv);
    ledGpio.value(0, function (err) {
        if (err) throw err;
        onoff.close(ledGpio, function(err) {
            if (err) throw err;
        });
    });
}, 5000);

