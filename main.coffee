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

app.use(express.static(__dirname + '/public'));

io.on 'connection', (socket) ->

  socket.on 'disconnect', () ->
    if socket.gamePadId != undefined
      console.info('Gamepad disconnected')
      gp_hub.disconnectGamepad socket.gamePadId, () ->
    else if socket.keyBoardId != undefined
      console.info('Keyboard disconnected')
      kb_hub.disconnectKeyboard socket.keyBoardId, () ->
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

http.on 'error', (err) ->
  switch err.message
    when "listen EACCES"
      console.error "You dont have permissions to open port", config.port,
        "For ports smaller than 1024, you need root previleges."
  throw err

http.listen config.port, () ->
  console.info "Listening on #{config.port}"
