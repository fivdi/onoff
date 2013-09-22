{
  "targets": [{
    "target_name": "epoll",
    "include_dirs" : [
      "<!(node -p -e \"require('path').dirname(require.resolve('nan'))\")"
    ],
    "sources": [
      "./src/epoll.cc"
    ]
  }]
}

