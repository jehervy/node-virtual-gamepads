###
Created by MIROOF on 04/03/2015
Virtual gamepad application
###

uinput = require './lib/uinput'
path = require('path')
express = require('express')
app  = express()
http = require('http').Server(app)
io = require('socket.io')(http)
config = require './config.json'

gamepad_hub = require './app/virtual_gamepad_hub'
hub = new gamepad_hub()

app.use(express.static(__dirname + '/public'));

io.on 'connection', (socket) ->

  socket.on 'disconnect', () ->
    if socket.gamePadId != undefined
      hub.disconnectGamepad socket.gamePadId, () ->

  socket.on 'connectGamepad', () ->
    hub.connectGamepad (gamePadId) ->
      if gamePadId != -1
        socket.gamePadId = gamePadId
        socket.emit 'gamepadConnected', {padId: gamePadId}

  socket.on 'padEvent', (data) ->
    if socket.gamePadId != undefined and data
      hub.sendEvent socket.gamePadId, data

http.listen config.port, () ->
  console.info "Listening on #{config.port}"