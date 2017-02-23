###
Created by MIROOF on 04/03/2015
Virtual gamepad application
###

path = require('path')
express = require('express')
app  = express()
http = require('http').Server(app)
io = require('socket.io')(http)
config = require './config.json'

gamepad_hub = require './app/virtual_gamepad_hub'
gp_hub = new gamepad_hub()
keyboard_hub = require './app/virtual_keyboard_hub'
kb_hub = new keyboard_hub()
trackpad_hub = require './app/virtual_trackpad_hub'
tp_hub = new trackpad_hub()

port = process.env.PORT || config.port

app.use(express.static(__dirname + '/public'));

io.on 'connection', (socket) ->

  socket.on 'disconnect', () ->
    if socket.gamePadId != undefined
      console.info('Gamepad disconnected')
      gp_hub.disconnectGamepad socket.gamePadId, () ->
    else if socket.keyBoardId != undefined
      console.info('Keyboard disconnected')
      kb_hub.disconnectKeyboard socket.keyBoardId, () ->
    else if socket.trackpadId != undefined
      console.info('Trackpad disconnected')
      tp_hub.disconnectTrackpad socket.trackpadId, () ->
    else
      console.info('Unknown disconnect')

  socket.on 'connectGamepad', () ->
    gp_hub.connectGamepad (gamePadId) ->
      if gamePadId != -1
        console.info('Gamepad connected')
        socket.gamePadId = gamePadId
        socket.emit 'gamepadConnected', {padId: gamePadId}
      else
        console.info('Gamepad connect failed')

  socket.on 'padEvent', (data) ->
    console.info('Pad event', data)
    if socket.gamePadId != undefined and data
      gp_hub.sendEvent socket.gamePadId, data


  socket.on 'connectKeyboard', () ->
    kb_hub.connectKeyboard (keyBoardId) ->
      if keyBoardId != -1
        console.info('Keyboard connected')
        socket.keyBoardId = keyBoardId
        socket.emit 'keyboardConnected', {boardId: keyBoardId}
      else
        console.info('Keyboard connect failed')

  socket.on 'boardEvent', (data) ->
    console.info('Board event', data)
    if socket.keyBoardId != undefined and data
      kb_hub.sendEvent socket.keyBoardId, data

  socket.on 'connectTrackpad', () ->
    tp_hub.connectTrackpad (trackpadId) ->
      if trackpadId != -1
        console.info('Trackpad connected')
        socket.trackpadId = trackpadId
        socket.emit 'trackpadConnected', {trackpadId: trackpadId}
      else
        console.info('Trackpad connect failed')

  socket.on 'trackpadEvent', (data) ->
    console.info('Trackpad event', data)
    if socket.trackpadId != undefined and data
      tp_hub.sendEvent socket.trackpadId, data

http.on 'error', (err) ->
  switch err.message
    when "listen EACCES"
      console.error "You don't have permissions to open port", port,
        "For ports smaller than 1024, you need root privileges."
  throw err

http.listen port, () ->
    console.info "Listening on #{port}"
