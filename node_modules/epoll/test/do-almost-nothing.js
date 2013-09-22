/*
 * Make sure process terminates when 'almsost nothing' is actually done.
 */
var Epoll = require("../build/Release/epoll").Epoll,
  epoll = new Epoll(function(){})
  stdin = 0; // fd for stdin

epoll.add(stdin, Epoll.EPOLLIN).remove(stdin).close();

