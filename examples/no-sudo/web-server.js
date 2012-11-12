var http = require('http'),
    Gpio = require('../../onoff').Gpio,
    led = new Gpio(17, 'out');

http.createServer(function (req, res) {
    led.read(function(err, value) {
        if (!err) {
            value = value === 1 ? 0 : 1;
            led.write(value)

            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('Toggled LED ' + (value ? 'on' : 'off') + '\n');
        }
    });
}).listen(8080);
console.log('listening on port 8080');

