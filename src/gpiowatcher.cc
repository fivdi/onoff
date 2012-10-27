#include <poll.h>
#include <errno.h>
#include <node.h>
#include <string>

/*
 * This Node.js addon can be used to detect interrupts on GPIO inputs.
 */

v8::Handle<v8::Value> Watch(const v8::Arguments& args);
void WatchWork(uv_work_t* req);
void WatchAfter(uv_work_t* req);

/*
 * Baton is used to pass information from JavaScript land to a worker thread
 * and back while watching a gpio and waiting for it to interrupt.
 */
struct Baton {
    uv_work_t request;

    // The number of the gpio to watch.
    uint32_t gpio;

    // The JavaScript callback to call when the gpio interrupts.
    v8::Persistent<v8::Function> callback;

    // The value of the gpio being watched on interrupt (0 or 1.)
    uint32_t value;

    // Information about errors detected in the worker thread.
    bool error;
    std::string error_message;
};

/*
 * Wait for a gpio to change its state (interrupt) and call the callback
 * when the state change occurs.
 *
 * args[0] gpio: number
 * args[1] callback: (err: error, value: number) => {}
 */
v8::Handle<v8::Value> Watch(const v8::Arguments& args) {
    v8::HandleScope scope;

    if (args.Length() != 2) {
        return ThrowException(v8::Exception::TypeError(
            v8::String::New("Wrong number of arguments")
        ));
    }

    if (!args[0]->IsUint32()) {
        return ThrowException(v8::Exception::TypeError(
            v8::String::New("First argument must be a gpio number")
        ));
    }

    if (!args[1]->IsFunction()) {
        return ThrowException(v8::Exception::TypeError(
            v8::String::New("Second argument must be a callback function")
        ));
    }

    Baton* baton = new Baton();
    baton->request.data = baton;
    baton->gpio = args[0]->Uint32Value();
    v8::Local<v8::Function> callback = v8::Local<v8::Function>::Cast(args[1]);
    baton->callback = v8::Persistent<v8::Function>::New(callback);
    baton->error = false;

    int status = uv_queue_work(uv_default_loop(), &baton->request,
        WatchWork, WatchAfter);
    assert(status == 0); // TODO - Should we be throwing an exception here like WatchAfter does?

    return v8::Undefined();
}

/*
 * Fill baton with error info.
 */
void SetError(Baton* baton) {
    baton->error = true;
    baton->error_message = strerror(errno);
}

void WatchWork(uv_work_t* req) {
    Baton* baton = static_cast<Baton*>(req->data);

    char filename[1024];
    sprintf(filename, "/sys/class/gpio/gpio%d/value", baton->gpio);

    int fd = open(filename, O_RDONLY);
    if (fd == -1) {
        SetError(baton);
    }
    else {
        char value[16];

        // Read fd before poll to avoid spurious notifications on Beaglebone.
        ssize_t size = read(fd, value, sizeof(value));
        if (size == -1) {
            SetError(baton);
        } else {
            struct pollfd pfd[1];
            pfd[0].fd = fd;
            pfd[0].events = POLLPRI | POLLERR;
            pfd[0].revents = 0;
            int ready = poll(pfd, 1, -1);

            // pfd[0].revents & POLLERR is always true on the Beaglebone after
            // calling poll even if there is no error so it's not handled.

            if (ready == -1) {
                SetError(baton);
            } else if (ready == 1 && pfd[0].revents & POLLPRI) {
                off_t offset = lseek(fd, 0, SEEK_SET);
                if (offset == -1) {
                    SetError(baton);
                } else {
                    ssize_t size = read(fd, value, sizeof(value));
                    if (size == -1) {
                        SetError(baton);
                    } else if (size >= 1 &&
                            (value[0] == '0' || value[0] == '1')) {
                        baton->value = value[0] == '0' ? 0 : 1;
                    } else {
                        baton->error = true;
                        baton->error_message = "No valid GPIO value found.";
                    }
                }
            } else {
                baton->error = true;
                baton->error_message = "Unexpected error polling file.";
            }
        }

        // If there was no error so far tell caller about close error else
        // tell caller about first error.
        if (close(fd) == -1 && !baton->error) {
            SetError(baton);
        }
    }
}

void WatchAfter(uv_work_t* req) {
    v8::HandleScope scope;
    Baton* baton = static_cast<Baton*>(req->data);

    if (baton->error) {
        v8::Local<v8::Value> err = v8::Exception::Error(
            v8::String::New(baton->error_message.c_str()));

        const unsigned argc = 1;
        v8::Local<v8::Value> argv[argc] = { err };

        v8::TryCatch try_catch;
        baton->callback->Call(v8::Context::GetCurrent()->Global(), argc, argv);
        if (try_catch.HasCaught()) {
            node::FatalException(try_catch);
        }
    } else {
        const unsigned argc = 2;
        v8::Local<v8::Value> argv[argc] = {
            v8::Local<v8::Value>::New(v8::Null()),
            v8::Local<v8::Value>::New(v8::Integer::New(baton->value))
        };

        v8::TryCatch try_catch;
        baton->callback->Call(v8::Context::GetCurrent()->Global(), argc, argv);
        if (try_catch.HasCaught()) {
            node::FatalException(try_catch);
        }
    }

    baton->callback.Dispose();
    delete baton;
}

void RegisterModule(v8::Handle<v8::Object> target) {
    target->Set(v8::String::NewSymbol("watch"),
        v8::FunctionTemplate::New(Watch)->GetFunction());
}

NODE_MODULE(gpiowatcher, RegisterModule);

