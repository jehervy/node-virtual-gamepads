###
Virtual touchpad hub class
###

touchpad = require './virtual_touchpad'

class virtual_touchpad_hub

  constructor: () ->
    @touchpads = []

  connectTouchpad: (callback) ->
    touchpadId = @touchpads.length

    # Create and connect the touchpad
    @touchpads[touchpadId] = new touchpad()
    @touchpads[touchpadId].connect () ->
      callback touchpadId
    , (err) ->
      callback -1

  disconnectTouchpad: (touchpadId, callback) ->
    if @touchpads[touchpadId]
      @touchpads[touchpadId].disconnect () =>
        @touchpads[touchpadId] = undefined
        callback()

  sendEvent: (touchpadId, event) ->
    if @touchpads[touchpadId]
      @touchpads[touchpadId].sendEvent event

module.exports = virtual_touchpad_hub
