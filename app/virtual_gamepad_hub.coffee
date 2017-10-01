###
Created by MIROOF on 04/03/2015
Virtual gamepad hub class
###

gamepad = require './virtual_gamepad'
config = require '../config.json'
winston = require('winston')
winston.level = config.logLevel

class virtual_gamepad_hub

  constructor: () ->
    @gamepads = []
    for i in [0..3]
      @gamepads[i] = undefined

  connectGamepad: (callback) ->
    padId = 0
    freeSlot = false

    # Check is a slot is available
    # and retrieve the corresponding gamepad id
    while !freeSlot and padId < 4
      if !@gamepads[padId]
        freeSlot = true
      else
        padId++

    if !freeSlot
      winston.log('warning', "Couldn't add new Gamepad: no slot left.")
      callback -1
    else
      # Create and connect the gamepad
      winston.log('info', 'Gamepad number', padId)
      @gamepads[padId] = new gamepad()
      @gamepads[padId].connect () ->
        callback padId
      , (err) ->
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
