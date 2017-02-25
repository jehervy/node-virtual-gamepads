###
Created by roba91 on 15/08/2016
Virtual keyboard class
###

fs = require 'fs'
ioctl = require 'ioctl'
uinput = require '../lib/uinput'
uinputStructs = require '../lib/uinput_structs'
config = require '../config.json'

class virtual_keyboard

  constructor: () ->

  connect: (callback, error) ->
    fs.open '/dev/uinput', 'w+', (err, fd) =>
      if err
        error err
      else
        @fd = fd

        # Init buttons
        ioctl @fd, uinput.UI_SET_EVBIT, uinput.EV_KEY
        for i in [0..255]
          ioctl @fd, uinput.UI_SET_KEYBIT, i

        uidev = new uinputStructs.uinput_user_dev
        uidev.name = Array.from("Virtual keyboard")
        uidev.id.bustype = uinput.BUS_USB
        uidev.id.vendor = 0x3
        uidev.id.product = 0x4
        uidev.id.version = 1
        uidev_buffer = uidev.ref()

        fs.write @fd, uidev_buffer, 0, uidev_buffer.length, null, (err) =>
          if err
            console.error err
            error err
          else
            try
              ioctl @fd, uinput.UI_DEV_CREATE
              callback()
            catch error
              console.error error
              fs.close @fd
              @fd = undefined
              @connect callback, error

  disconnect: (callback) ->
    if @fd
      ioctl @fd, uinput.UI_DEV_DESTROY
      fs.close @fd
      @fd = undefined
      callback()

  sendEvent: (event) ->
    console.log(event)
    if @fd
      ev = new uinputStructs.input_event
      ev.type = event.type
      ev.code = event.code
      ev.value = event.value
      ev.time.tv_sec = Math.round(Date.now() / 1000)
      ev.time.tv_usec = Math.round(Date.now() % 1000 * 1000)
      ev_buffer = ev.ref()

      ev_end = new uinputStructs.input_event
      ev_end.type = 0
      ev_end.code = 0
      ev_end.value = 0
      ev_end.time.tv_sec = Math.round(Date.now() / 1000)
      ev_end.time.tv_usec = Math.round(Date.now() % 1000 * 1000)
      ev_end_buffer = ev_end.ref()

      fs.writeSync @fd, ev_buffer, 0, ev_buffer.length, null
      fs.writeSync @fd, ev_end_buffer, 0, ev_end_buffer.length, null

module.exports = virtual_keyboard
