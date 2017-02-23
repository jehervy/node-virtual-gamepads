###
Virtual trackpad hub class
###

trackpad = require './virtual_trackpad'

class virtual_trackpad_hub

  constructor: () ->
    @trackpads = []

  connectTrackpad: (callback) ->
    trackpadId = @trackpads.length

    # Create and connect the trackpad
    @trackpads[trackpadId] = new trackpad()
    @trackpads[trackpadId].connect () ->
      callback trackpadId
    , (err) ->
      callback -1

  disconnectTrackpad: (trackpadId, callback) ->
    if @trackpads[trackpadId]
      @trackpads[trackpadId].disconnect () =>
        @trackpads[trackpadId] = undefined
        callback()

  sendEvent: (trackpadId, event) ->
    if @trackpads[trackpadId]
      @trackpads[trackpadId].sendEvent event

module.exports = virtual_trackpad_hub
