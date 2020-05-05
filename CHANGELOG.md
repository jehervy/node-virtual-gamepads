Upcoming
========
  * Allow theoretically infinitely many gamepads to connect to the server.
    Adding a setting in `config.json` to set the LED combination for each
    gamepad.
  * Update dependencies to also support nodejs version 12.
  * Disable context menu (e.g. when long touching on android)
  * Added [contribution guide](CONTRIBUTING.md)
  * Update Readme "developing" section
  * Allow script to be called out of its containing folder

1.4.0
=====
  * Fix error when disconnecting clients (missing argument for fs.close)
  * Using npm lock file to fix dependencies' versions
  * Allow log level to be set with environment variable `LOGLEVEL`
  * Adding timestamp to log output
  * Kill server process if main.js (monitoring) gets killed.
    This will **not work for** `SIGKILL`. When you forcefully kill the
    server, make sure to kill it's child processes as well if intended.
  * Improve logging
  * Bug fixes:
    * Crash on failing keyboard initialization
  * Update dependencies
  * Add physical gamepad support to the client

1.3.0
=====
  * Introduced Changelog
  * Improved documentation (e.g. explaining `config.json`)
  * D-Pad supports analog stick behaviour by default
  * Improved logging
  * Using module `forever-monitor` to restart the server if it crashes
    for some reason.
  * Bug fixes
