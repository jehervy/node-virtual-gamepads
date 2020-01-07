NEXT
====
  * Fix error when disconnecting clients (missing argument for fs.close)
  * Using `npm shrinkwrap` to fix dependency's versions
  * Allow log level to be set with environment variable `LOGLEVEL`
  * Adding timestamp to log output
  * Kill server process if main.js (monitoring) gets killed.
    This will **not work for** `SIGKILL`. When you forcefully kill the
    server, make sure to kill it's child processes as well if intended.
  * Improve logging
  * Bug fixes:
    * Crash on failing keyboard initialization
  * Update dependencies

1.3.0
=====
  * Introduced Changelog
  * Improved documentation (e.g. explaining `config.json`)
  * D-Pad supports analog stick behaviour by default
  * Improved logging
  * Using module `forever-monitor` to restart the server if it crashes
    for some reason.
  * Bug fixes
