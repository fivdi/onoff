var fs = require('fs');

exports = module.exports = {
  read: function (fd) {
    var buf = new Buffer(1024);
    fs.readSync(fd, buf, 0, buf.length, null);
  }
};

