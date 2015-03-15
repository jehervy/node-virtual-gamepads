###
Created by MIROOF on 04/03/2015
vjoy application
###

uinput = require '../lib/uinput'
path = require('path')
express = require('express')
app  = express()
http = require('http').Server(app)
io = require('socket.io')(http)

gamepad_hub = require './virtual_gamepad_hub'
hub = new gamepad_hub()

app.use( express.static( '../public' ) );

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

http.listen 80, () ->
  console.info "Listening on 80"