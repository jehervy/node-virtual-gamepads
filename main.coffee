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
touchpad_hub = require './app/virtual_touchpad_hub'
tp_hub = new touchpad_hub()

port = process.env.PORT || config.port

# Add URL query string if analog mode is enabled
if config.analog
  suffix = '?analog'
else
  suffix = ''

# draw routes
app.get '/', (req, res) ->
  if config.useGamepadByDefault
    res.redirect 'gamepad.html' + suffix
  else
    res.redirect 'index.html' + suffix

app.use(express.static(__dirname + '/public'));

# socket io
io.on 'connection', (socket) ->

  socket.on 'disconnect', () ->
    if socket.gamePadId != undefined
      console.info('Gamepad disconnected')
      gp_hub.disconnectGamepad socket.gamePadId, () ->
    else if socket.keyBoardId != undefined
      console.info('Keyboard disconnected')
      kb_hub.disconnectKeyboard socket.keyBoardId, () ->
    else if socket.touchpadId != undefined
      console.info('Touchpad disconnected')
      tp_hub.disconnectTouchpad socket.touchpadId, () ->
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

  socket.on 'connectTouchpad', () ->
    tp_hub.connectTouchpad (touchpadId) ->
      if touchpadId != -1
        console.info('Touchpad connected')
        socket.touchpadId = touchpadId
        socket.emit 'touchpadConnected', {touchpadId: touchpadId}
      else
        console.info('Touchpad connect failed')

  socket.on 'touchpadEvent', (data) ->
    console.info('Touchpad event', data)
    if socket.touchpadId != undefined and data
      tp_hub.sendEvent socket.touchpadId, data

http.on 'error', (err) ->
  if err.hasOwnProperty('errno')
    switch err.errno
      when "EACCES"
        console.error "You don't have permissions to open port", port, ".",
          "For ports smaller than 1024, you need root privileges."
  throw err

http.listen port, () ->
    console.info "Listening on #{port}"
