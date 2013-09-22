/*
 * 
 */
var Epoll = require("../build/Release/epoll").Epoll,
  util = require('./util'),
  eventCount = 0,
  epoll,
  stdin = 0; // fd for stdin

epoll = new Epoll(function (err, fd, events) {
  eventCount++;

  if (eventCount === 1 && events & Epoll.EPOLLIN) {
    setTimeout(function () {
      epoll.modify(fd, Epoll.EPOLLIN | Epoll.EPOLLONESHOT);
    }, 500);
  } else if (eventCount === 2 && events & Epoll.EPOLLIN) {
    setTimeout(function () {
      util.read(fd); // read user input (the enter key)
      epoll.remove(fd).close();
    }, 500);
  } else {
    console.log('two-shot *** Error: unexpected event');
  }
});

epoll.add(stdin, Epoll.EPOLLIN | Epoll.EPOLLONESHOT);

console.log('...Please press the enter key once.');

