/*
 * Create a million epoll instances and use each of them to detect a single
 * event. 
 */
var Epoll = require("../build/Release/epoll").Epoll,
  util = require('./util'),
  count = 0,
  stdin = 0; // fd for stdin

console.log('...Please press the enter key once.');

function once() {
  var epoll = new Epoll(function (error, fd, events) {
    epoll.remove(fd).close();

    count++;

    if (count % 100000 === 0) {
      console.log(count + ' instances created and events detected ');
    }
    if (count < 1000000) {
      once();
    } else {
      util.read(fd);
    }
  });

  epoll.add(stdin, Epoll.EPOLLIN);
}

once();

