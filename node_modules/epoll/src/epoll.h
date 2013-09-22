#ifndef EPOLL_H
#define EPOLL_H

class Epoll : public node::ObjectWrap {
  public:
    static void Init(v8::Handle<v8::Object> exports);
    static void DispatchEvent(uv_async_t* handle, int status);

  private:
    Epoll(NanCallback *callback);
    ~Epoll();

    static NAN_METHOD(New);
    static NAN_METHOD(Add);
    static NAN_METHOD(Modify);
    static NAN_METHOD(Remove);
    static NAN_METHOD(Close);

    int Add(int fd, uint32_t events);
    int Modify(int fd, uint32_t events);
    int Remove(int fd);
    int Close();
    void DispatchEvent(int err, struct epoll_event *event);

    NanCallback *callback_;
    std::list<int> fds_;
    bool closed_;

    static v8::Persistent<v8::FunctionTemplate> constructor;
    static std::map<int, Epoll*> fd2epoll;
};

#endif

