# node-virtual-gamepads

This nodejs application provides the possibility to use your smarpthone as a gamepad controller
on Linux OS simply by reaching a local address.
You can virtually plug **up to 4** gamepad controllers.

Demo
----
Demo video 1 player in game [here](https://www.youtube.com/watch?v=OWgWugNsF7w)

Demo video 3 players on EmulStation [here](https://www.youtube.com/watch?v=HQROnYLRyOw)

Prerequisite
------------
This application is only compatible with Linux OS with the **uinput** kernel module installed.

Installation
------------
    git clone https://github.com/miroof/node-virtual-gamepads
    cd node-virtual-gamepads
    npm install
    sudo node main.js

If you encounter problems while installing or running node-virtual-gamepads have
a look at the [troubleshooting](TROUBLESHOOTING.md) page.

Usage
-----
Once the nodejs application is launched, you just have to plug your gamepad controller
by connecting your device on the same local network and by reaching the address *http://node_server_adress*

Features
--------
### Plug up to 4 virtual gamepads
The application will plug automatically a new controller when the web application is launched and unplug it at disconnection.
4 slots are available so 4 virtual gamepads can be created. You can see your current slot on the indicator directly on the vitual gamepad.

![Virtual gamepad](https://github.com/miroof/node-virtual-gamepads/blob/resources/screenshots/standalone.png?raw=true)

### Use it as standalone application (chrome mobile)
With the [add to homescreen](https://developer.chrome.com/multidevice/android/installtohomescreen) chrome feature,
you can easily use virtual gamepads application without launching the browser each time you want to play.

With only 3 clicks, virtual gamepads web application becomes a standalone application.

![Standalone installation step 1](https://github.com/miroof/node-virtual-gamepads/blob/resources/screenshots/standalone_step1.png?raw=true)
![Standalone installation step 2](https://github.com/miroof/node-virtual-gamepads/blob/resources/screenshots/standalone_step2.png?raw=true)

Then a shortcut is added on your homescreen and the application will be launched outside the browser.

![Virtual gamepad directly from the homescreen](https://github.com/miroof/node-virtual-gamepads/blob/resources/screenshots/standalone_step3.png?raw=true)
![Launched outside the browser](https://github.com/miroof/node-virtual-gamepads/blob/resources/screenshots/standalone_step4.png?raw=true)

### Enjoy haptic feedbacks
Because it's difficult to spot the right place in a touch screen without looking at it,
the touch zone of each button was increased. LT button was moved at the center of the screen
to let as much space as possible for the joystick and avoid touch mistakes.

![Step 1](https://github.com/miroof/node-virtual-gamepads/blob/resources/schemas/touch_zones.png?raw=true)

To know if we pressed a button with success, the web application provides an haptic feedback
which can be easily deactivated by turning off the vibrations of the phone.

Developing
----------
For developing you will also have to install coffeescript

    sudo apt-get install coffeescript

When you changed something in a coffeescript (e.g. main.coffee) run

    coffee -c main.coffee

This will compile main.coffee to main.js wich than can be run with node
(see [Installation](README.md#installation))
To compile all coffee files when ever they change run

    coffee -cw .

