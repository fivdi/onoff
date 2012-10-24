var onoff = require('../onoff'),
    ledPin = 17,
    count = 0,
    iv;

var loop = function () {
    onoff.value(ledPin, 1, function (err) {
        if (err) throw err;
        onoff.value(ledPin, 0, function () {
            if (err) throw err;
            count += 1;
            process.nextTick(function () {
                loop();
            });
        })
    });
};

onoff.exp(ledPin, function(err) {
    if (err) throw err;
    onoff.direction(ledPin, 'out', function (err) {
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
    onoff.value(ledPin, 0, function (err) {
        if (err) throw err;
        onoff.unexp(ledPin, function() {
            if (err) throw err;
        });
    });
}, 5000);

