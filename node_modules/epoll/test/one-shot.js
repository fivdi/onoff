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
      util.read(fd); // read user input (the enter key)
      epoll.remove(fd).close();
    }, 500);
  } else {
    console.log('one-shot *** Error: unexpected event');
  }
});

epoll.add(stdin, Epoll.EPOLLIN | Epoll.EPOLLONESHOT);

console.log('...Please press the enter key once.');

