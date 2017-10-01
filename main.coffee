###
Created by Robsdedude on 01/10/2017
Virtual gamepad application
###

forever = require('forever-monitor')
config = require './config.json'
winston = require('winston')
winston.level = config.logLevel

server = new (forever.Monitor)('server.js', {
  max: Infinity,
  args: [],
});

server.on 'exit', ->
  winston.log 'error', 'server.js has exited (gave up to restart)';

earlyDeathCount = 0
server.on 'exit:code', ->
  diedAfter = Date.now() - server.ctime
  winston.log 'info', 'diedAfter:', diedAfter
  earlyDeathCount = if diedAfter < 5000 then earlyDeathCount+1 else 0
  winston.log 'info', 'earlyDeathCount:', earlyDeathCount
  if earlyDeathCount >= 3
    winston.log 'error', 'Died too often too fast.'
    server.stop()

server.on 'restart', ->
  winston.log 'error' ,'Forever restarting script for ' + server.times + ' time'

server.start();