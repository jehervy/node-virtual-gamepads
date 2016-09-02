###
Created by roba03 on 15/08/2016
Virtual keyboard hub class
###

keyboard = require './virtual_keyboard'

class virtual_keyboard_hub

  constructor: () ->
    @keyboards = []

  connectKeyboard: (callback) ->
    boardId = @keyboards.length

    # Create and connect the keyboard
    @keyboards[boardId] = new keyboard()
    @keyboards[boardId].connect () ->
      callback boardId
    , (err) ->
      callback -1

  disconnectKeyboard: (boardId, callback) ->
    if @keyboards[boardId]
      @keyboards[boardId].disconnect () =>
        @keyboards[boardId] = undefined
        callback()

  sendEvent: (boardId, event) ->
    if @keyboards[boardId]
      @keyboards[boardId].sendEvent event

module.exports = virtual_keyboard_hub
