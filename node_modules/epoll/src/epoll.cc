#ifdef __linux__

#include <errno.h> // errno
#include <pthread.h>
#include <stdio.h> // TODO - Remove
#include <string.h> // strerror
#include <sys/epoll.h>
#include <unistd.h>
#include <map>
#include <list>

#include <uv.h>
#include <v8.h>
#include <node.h>
#include <node_object_wrap.h>

#include <nan.h>

#include "epoll.h"

using namespace v8;

// TODO - strerror isn't threadsafe, use strerror_r instead
// TODO - use uv_strerror rather than strerror_t for libuv errors
// TODO - Tidy up thread stuff and global vars

/*
 * Watcher thread
 */

// TODO - The variable names here look terrible
static int watcher_epfd_g;

static uv_sem_t watcher_sem_g;
static uv_async_t watcher_async_g;

static struct epoll_event watcher_event_g;
static int watcher_errno_g;

static void *watcher(void *arg) {
  while (true) {
    // Wait till the event loop says it's ok to poll.
    uv_sem_wait(&watcher_sem_g);

    int count = epoll_wait(watcher_epfd_g, &watcher_event_g, 1, -1);
    watcher_errno_g = count == -1 ? errno : 0;

    // Errors returned from uv_async_send are silently ignored.
    uv_async_send(&watcher_async_g);
  }

  return 0;
}

// TODO - start_watcher looks terrible.
static void start_watcher() {
  pthread_t theread_id;

  // TODO - Create a method callable from JS for starting the thread so that
  // it's possible to pass arguments to epoll_create1 and pass errors back to
  // JS.
  watcher_epfd_g = epoll_create1(0);
  if (watcher_epfd_g == -1) {
    printf("%s\n", strerror(errno));
    return;
  }

  int err = uv_sem_init(&watcher_sem_g, 1);
  if (err < 0) {
    close(watcher_epfd_g);
    printf("%s\n", strerror(-err));
    return;
  }

  err = uv_async_init(uv_default_loop(), &watcher_async_g, Epoll::DispatchEvent);
  if (err < 0) {
    close(watcher_epfd_g);
    uv_sem_destroy(&watcher_sem_g);
    printf("%s\n", strerror(-err));
    return;
  }

  // Prevent watcher_async_g from keeping the event loop alive.
  uv_unref((uv_handle_t *) &watcher_async_g);

  err = pthread_create(&theread_id, 0, watcher, 0);
  if (err != 0) {
    close(watcher_epfd_g);
    uv_sem_destroy(&watcher_sem_g);
    uv_close((uv_handle_t *) &watcher_async_g, 0);
    printf("%s\n", strerror(err));
    return;
  }
}


/*
 * Epoll
 */
Persistent<FunctionTemplate> Epoll::constructor;
std::map<int, Epoll*> Epoll::fd2epoll;


Epoll::Epoll(NanCallback *callback)
  : callback_(callback), closed_(false) {
};


Epoll::~Epoll() {
  // v8 decides when and if destructors are called. In particular, if the
  // process is about to terminate, it's highly likely that destructors will
  // not be called. This is therefore not the place for calling the likes of
  // uv_unref, which, in general, must be called to terminate a process
  // gracefully!
  NanScope();

  if (callback_) delete callback_;
};


void Epoll::Init(Handle<Object> exports) {
  NanScope();

  // Constructor
  Local<FunctionTemplate> ctor = FunctionTemplate::New(Epoll::New);
  NanAssignPersistent(FunctionTemplate, constructor, ctor);
  ctor->SetClassName(NanSymbol("Epoll"));
  ctor->InstanceTemplate()->SetInternalFieldCount(1);

  // Prototype
  NODE_SET_PROTOTYPE_METHOD(ctor, "add", Add);
  NODE_SET_PROTOTYPE_METHOD(ctor, "modify", Modify);
  NODE_SET_PROTOTYPE_METHOD(ctor, "remove", Remove);
  NODE_SET_PROTOTYPE_METHOD(ctor, "close", Close);

  NODE_DEFINE_CONSTANT(ctor, EPOLLIN);
  NODE_DEFINE_CONSTANT(ctor, EPOLLOUT);
  NODE_DEFINE_CONSTANT(ctor, EPOLLRDHUP);
  NODE_DEFINE_CONSTANT(ctor, EPOLLPRI); // The reason this addon exists!
  NODE_DEFINE_CONSTANT(ctor, EPOLLERR);
  NODE_DEFINE_CONSTANT(ctor, EPOLLHUP);
  NODE_DEFINE_CONSTANT(ctor, EPOLLET);
  NODE_DEFINE_CONSTANT(ctor, EPOLLONESHOT);

  exports->Set(NanSymbol("Epoll"), ctor->GetFunction());
}


NAN_METHOD(Epoll::New) {
  NanScope();

  // TODO - Can throw be avoided here? Maybe with a default empty handler?
  if (args.Length() < 1 || !args[0]->IsFunction())
    return NanThrowError("First argument to construtor must be a callback");

  NanCallback *callback = new NanCallback(Local<Function>::Cast(args[0]));

  Epoll *epoll = new Epoll(callback);
  epoll->Wrap(args.This());

  NanReturnValue(args.This());
}


NAN_METHOD(Epoll::Add) {
  NanScope();

  Epoll *epoll = ObjectWrap::Unwrap<Epoll>(args.This());

  if (epoll->closed_)
    return NanThrowError("add can't be called after close has been called");

  if (args.Length() < 2 || !args[0]->IsInt32() || !args[1]->IsUint32())
    return NanThrowError("incorrect arguments passed to add(int fd, uint32_t events)");

  int err = epoll->Add(args[0]->Int32Value(), args[1]->Uint32Value());
  if (err != 0)
    return NanThrowError(strerror(err), err);

  NanReturnValue(args.This());
}


NAN_METHOD(Epoll::Modify) {
  NanScope();

  Epoll *epoll = ObjectWrap::Unwrap<Epoll>(args.This());

  if (epoll->closed_)
    return NanThrowError("modify can't be called after close has been called");

  if (args.Length() < 2 || !args[0]->IsInt32() || !args[1]->IsUint32())
    return NanThrowError("incorrect arguments passed to maodify(int fd, uint32_t events)");

  int err = epoll->Modify(args[0]->Int32Value(), args[1]->Uint32Value());
  if (err != 0)
    return NanThrowError(strerror(err), err);

  NanReturnValue(args.This());
}


NAN_METHOD(Epoll::Remove) {
  NanScope();

  Epoll *epoll = ObjectWrap::Unwrap<Epoll>(args.This());

  if (epoll->closed_)
    return NanThrowError("remove can't be called after close has been called");

  if (args.Length() < 1 || !args[0]->IsInt32())
    return NanThrowError("incorrect arguments passed to remove(int fd)");

  int err = epoll->Remove(args[0]->Int32Value());
  if (err != 0)
    return NanThrowError(strerror(err), err);

  NanReturnValue(args.This());
}


NAN_METHOD(Epoll::Close) {
  NanScope();

  Epoll *epoll = ObjectWrap::Unwrap<Epoll>(args.This());

  if (epoll->closed_)
    return NanThrowError("close can't be called more than once");

  int err = epoll->Close();
  if (err != 0)
    return NanThrowError(strerror(err), err);

  NanReturnNull();
}


int Epoll::Add(int fd, uint32_t events) {
  struct epoll_event event;
  event.events = events; // EPOLLIN; // EPOLLPRI;
  event.data.fd = fd;

  if (epoll_ctl(watcher_epfd_g, EPOLL_CTL_ADD, fd, &event) == -1)
    return errno;

  fd2epoll.insert(std::pair<int, Epoll*>(fd, this)); // TODO - Error handling, fd may not be there.
  fds_.push_back(fd); // TODO - Error handling, fd may not be there.

  // Keep event loop alive. uv_unref called in Remove.
  uv_ref((uv_handle_t *) &watcher_async_g);

  return 0;
}


int Epoll::Modify(int fd, uint32_t events) {
  struct epoll_event event;
  event.events = events;
  event.data.fd = fd;

  if (epoll_ctl(watcher_epfd_g, EPOLL_CTL_MOD, fd, &event) == -1)
    return errno;

  fd2epoll.insert(std::pair<int, Epoll*>(fd, this)); // TODO - Error handling, fd may not be there.
  fds_.push_back(fd); // TODO - Error handling, fd may not be there.

  // Keep event loop alive. uv_unref called in Remove.
  uv_ref((uv_handle_t *) &watcher_async_g);

  return 0;
}


int Epoll::Remove(int fd) {
  if (epoll_ctl(watcher_epfd_g, EPOLL_CTL_DEL, fd, 0) == -1)
    return errno;

  fd2epoll.erase(fd); // TODO - Error handling, fd may not be there.
  fds_.remove(fd); // TODO - Error handling, fd may not be there.

  if (fd2epoll.empty())
    uv_unref((uv_handle_t *) &watcher_async_g);

  return 0;
}


int Epoll::Close() {
  closed_ = true;

  delete callback_;
  callback_ = 0;
  
  std::list<int>::iterator it = fds_.begin();
  while (it != fds_.end()) {
    int err = Remove(*it);
    if (err != 0)
      return err; // TODO - Returning here leaves things messed up.
    it = fds_.begin();
  }

  return 0;
}


void Epoll::DispatchEvent(uv_async_t* handle, int status) {
  // This method is executed in the event loop thread.
  // By the time flow of control arrives here the original Epoll instance that
  // registered interest in the event may no longer have this interest. If
  // this is the case, the event will silently be ignored.
  std::map<int, Epoll*>::iterator it = fd2epoll.find(watcher_event_g.data.fd);

  if (it != fd2epoll.end()) {
    it->second->DispatchEvent(watcher_errno_g, &watcher_event_g);
  } else {
    printf("lost interest in %d\n", watcher_event_g.data.fd); // TODO - Remove printf.
  }

  uv_sem_post(&watcher_sem_g);
}


void Epoll::DispatchEvent(int err, struct epoll_event *event) {
  NanScope();

  if (err) {
    Local<Value> args[1] = {
      Exception::Error(String::New(strerror(err)))
    };
    callback_->Call(1, args);
  } else {
    Local<Value> args[3] = {
      Local<Value>::New(Null()),
      Integer::New(event->data.fd),
      Integer::New(event->events)
    };
    callback_->Call(3, args);
  }
}


extern "C" void Init(Handle<Object> exports) {
  NanScope();

  Epoll::Init(exports);

  // TODO - Allow JavaScript to start the thread
  start_watcher();
}

NODE_MODULE(epoll, Init)

#endif
