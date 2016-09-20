###
Created by MIROOF on 04/03/2015
Virtual gamepad class
###

fs = require 'fs'
ioctl = require 'ioctl'
uinput = require '../lib/uinput'
Struct = require 'struct'
config = require '../config.json'

if not config.x64
  TimeStruct = -> Struct().word32Sle('tv_sec').word32Sle('tv_usec')
else
  TimeStruct = -> Struct().word64Sle('tv_sec').word64Sle('tv_usec')

class virtual_gamepad

  constructor: () ->

  connect: (callback, error) ->
    fs.open '/dev/uinput', 'w+', (err, fd) =>
      if err
        error err
      else
        @fd = fd

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

        input_id = Struct()
          .word16Sle('bustype')
          .word16Sle('vendor')
          .word16Sle('product')
          .word16Sle('version')

        uinput_user_dev = Struct()
          .chars('name', uinput.UINPUT_MAX_NAME_SIZE)
          .struct('id', input_id)
          .word32Sle('ff_effects_max')
          .array('absmax', uinput.ABS_CNT, 'word32Sle')
          .array('absmin', uinput.ABS_CNT, 'word32Sle')
          .array('absfuzz', uinput.ABS_CNT, 'word32Sle')
          .array('absflat', uinput.ABS_CNT, 'word32Sle');

        uinput_user_dev.allocate()
        buffer = uinput_user_dev.buffer()
        buffer.fill(0)

        uidev = uinput_user_dev.fields

        uidev.name = "Virtual gamepad"
        uidev.id.bustype = uinput.BUS_USB
        uidev.id.vendor = 0x3
        uidev.id.product = 0x3
        uidev.id.version = 2

        uidev.absmax[uinput.ABS_X] = 255
        uidev.absmin[uinput.ABS_X] = 0
        uidev.absfuzz[uinput.ABS_X] = 0
        uidev.absflat[uinput.ABS_X] = 15

        uidev.absmax[uinput.ABS_Y] = 255
        uidev.absmin[uinput.ABS_Y] = 0
        uidev.absfuzz[uinput.ABS_Y] = 0
        uidev.absflat[uinput.ABS_Y] = 15

        fs.write @fd, buffer, 0, buffer.length, null, (err) =>
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
    if @fd
      input_event = Struct()
        .struct('time', TimeStruct())
        .word16Ule('type')
        .word16Ule('code')
        .word32Sle('value')
      input_event.allocate()
      ev_buffer = input_event.buffer()
      ev = input_event.fields

      ev.type = event.type
      ev.code = event.code
      ev.value = event.value
      ev.time.tv_sec = Math.round(Date.now() / 1000)
      ev.time.tv_usec = Math.round(Date.now() % 1000 * 1000)

      input_event_end = Struct()
        .struct('time', TimeStruct())
        .word16Ule('type')
        .word16Ule('code')
        .word32Sle('value')
      input_event_end.allocate()
      ev_end_buffer = input_event_end.buffer()
      ev_end = input_event_end.fields

      ev_end.type = 0
      ev_end.code = 0
      ev_end.value = 0
      ev_end.time.tv_sec = Math.round(Date.now() / 1000)
      ev_end.time.tv_usec = Math.round(Date.now() % 1000 * 1000)

      fs.writeSync @fd, ev_buffer, 0, ev_buffer.length, null
      fs.writeSync @fd, ev_end_buffer, 0, ev_end_buffer.length, null

module.exports = virtual_gamepad
