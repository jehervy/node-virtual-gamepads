###
Created by Robsdedude on 01/10/2017
Virtual gamepad application
###

forever = require('forever-monitor')
log = require './lib/log'

server = new (forever.Monitor)(
  require('path').resolve(__dirname, 'server.js'), {
  max: Infinity,
  args: [],
});

exiting = false

server.on 'exit', ->
  log 'warning', 'server.js has exited';

earlyDeathCount = 0
server.on 'exit:code', ->
  return if exiting
  diedAfter = Date.now() - server.ctime
  log 'info', 'diedAfter: ' + diedAfter
  earlyDeathCount = if diedAfter < 5000 then earlyDeathCount+1 else 0
  log 'info', 'earlyDeathCount: ' + earlyDeathCount
  if earlyDeathCount >= 3
    log 'error', 'Died too often too fast.'
    server.stop()

server.on 'restart', ->
  log 'error' ,'Forever restarting script for ' + server.times + ' time'


for sig in ['SIGTERM', 'SIGINT', 'exit']
  process.on sig, ((s) -> ->
    log 'info', 'received ' + s
    exiting = true
    server.stop()
  )(sig)


server.start();