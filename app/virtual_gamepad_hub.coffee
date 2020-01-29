###
Created by MIROOF on 04/03/2015
Virtual gamepad hub class
###

gamepad = require './virtual_gamepad'
log = require '../lib/log'
config = require '../config'

num_gamepads = config.ledBitFieldSequence.length
# ledBitFieldSequence should be an array of 'bit fields'.
# the bit fields are numbers from 0-15, resulting in the following LED arrangements:
#  0 - ....
#  1 - *...
#  2 - .*..
#  3 - **..
#  4 - ..*.
#  5 - *.*.
#  6 - .**.
#  7 - ***.
#  8 - ...*
#  9 - *..*
# 10 - .*.*
# 11 - **.*
# 12 - ..**
# 13 - *.**
# 14 - .***
# 15 - ****

class virtual_gamepad_hub

  constructor: () ->
    @gamepads = []
    for i in [0..(num_gamepads-1)]
      @gamepads[i] = undefined

  connectGamepad: (callback) ->
    padId = 0
    freeSlot = false

    # Check is a slot is available
    # and retrieve the corresponding gamepad id
    while !freeSlot and padId < num_gamepads
      if !@gamepads[padId]
        freeSlot = true
      else
        padId++

    if !freeSlot
      log 'warning', "Couldn't add new gamepad: no slot left."
      callback -1
    else
      # Create and connect the gamepad
      log 'info', 'Creating and connecting to gamepad number ' + padId
      @gamepads[padId] = new gamepad()
      @gamepads[padId].connect () ->
        callback padId
      , (err) ->
        @gamepads[padId] = undefined
        log 'error', "Couldn't connect to gamepad:\n" + JSON.stringify(err)
        callback -1

  disconnectGamepad: (padId, callback) ->
    if @gamepads[padId]
      @gamepads[padId].disconnect () =>
        @gamepads[padId] = undefined
        callback()

  sendEvent: (padId, event) ->
    if @gamepads[padId]
      @gamepads[padId].sendEvent event

module.exports = virtual_gamepad_hub
