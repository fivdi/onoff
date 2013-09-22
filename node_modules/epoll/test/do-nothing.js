/*
 * Make sure process terminates when 'nothing' is actually done.
 */
var Epoll = require("../build/Release/epoll").Epoll,
  epoll0 = new Epoll(function(){}),
  epoll1 = new Epoll(function(){});

