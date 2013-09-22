/*
 * Detect 1000000 events
 */
var Epoll = require("../build/Release/epoll").Epoll,
  util = require('./util'),
  count = 0,
  stdin = 0; // fd for stdin

console.log('...Please press the enter key once.');

var epoll = new Epoll(function (error, fd, events) {
  count++;
  if (count % 100000 === 0) {
    console.log(count + ' events detected');
    if (count === 1000000) {
      epoll.remove(fd).close();
      util.read(fd);
    }
  }
});

epoll.add(stdin, Epoll.EPOLLIN);

