#!/bin/bash
node ./node_modules/node-gyp/bin/node-gyp rebuild && cp ./build/Release/ioctl.node ./node_modules/ioctl.node
