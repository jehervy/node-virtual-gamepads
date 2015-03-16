###
Created by MIROOF on 04/03/2015
Virtual gamepad class
###

fs = require 'fs'
ioctl = require 'ioctl'
uinput = require '../lib/uinput'
restruct = require 'restruct'

class virtual_gamepad

  constructor: () ->

  connect: (id, callback, error) ->
    fs.open '/dev/uinput', 'w+', (err, fd) =>
      if err
        error err
      else
        @fd = fd
        uidev = new Buffer uinput.uinput_user_dev.pack
          name: "Virtual gamepad #{id}"
          id:
            bustype: uinput.BUS_USB
            vendor: 0x1
            product: 0x1
            version: 1
        fs.write @fd, uidev, 0, uidev.length, null, (err) =>
          if err
            error err
          else
            # Init buttons
            ioctl @fd, uinput.UI_SET_EVBIT, uinput.EV_KEY
            ioctl @fd, uinput.UI_SET_KEYBIT, uinput.BTN_A
            ioctl @fd, uinput.UI_SET_KEYBIT, uinput.BTN_B
            ioctl @fd, uinput.UI_SET_KEYBIT, uinput.BTN_X
            ioctl @fd, uinput.UI_SET_KEYBIT, uinput.BTN_Y
            ioctl @fd, uinput.UI_SET_KEYBIT, uinput.BTN_TL
            ioctl @fd, uinput.UI_SET_KEYBIT, uinput.BTN_TR
            ioctl @fd, uinput.UI_SET_KEYBIT, uinput.BTN_START
            ioctl @fd, uinput.UI_SET_KEYBIT, uinput.BTN_SELECT
            # Init directions
            ioctl @fd, uinput.UI_SET_EVBIT, uinput.EV_ABS
            ioctl @fd, uinput.UI_SET_ABSBIT, uinput.ABS_X
            ioctl @fd, uinput.UI_SET_ABSBIT, uinput.ABS_Y

            ioctl @fd, uinput.UI_DEV_CREATE, 0
            callback()

  disconnect: (callback) ->
    if @fd
      ioctl @fd, uinput.UI_DEV_DESTROY, 0
      callback()

  sendEvent: (event) ->
    if @fd
      ev = new Buffer uinput.input_event.pack
        type: event.type
        code: event.code
        value: event.value
        time:
          tv_sec: Math.round(Date.now() / 1000)
          tv_usec: Math.round(Date.now() % 1000 * 1000)
      ev_end = new Buffer uinput.input_event.pack
        type: uinput.EV_SYNC
        code: 0
        value: 0
        time:
          tv_sec: Math.round(Date.now() / 1000)
          tv_usec: Math.round(Date.now() % 1000 * 1000)
      fs.writeSync @fd, ev, 0, ev.length, null
      fs.writeSync @fd, ev_end, 0, ev_end.length, null

module.exports = virtual_gamepad
