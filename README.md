# node-virtual-gamepads

This nodejs application provides the possibility to use your smarpthone (but also all device with a web browser) as a gamepad controller on Linux OS simply by reaching a local address.
You can virtually plug up to four gamepad controllers.

Prerequisite
------------
This application is only compatible with Linux OS with the **uinput** kernel module installed.

Installation
------------
    git clone https://github.com/miroof/node-virtual-gamepads
    cd node-virtual-gamepads
    npm install
    sudo node main.js

Usage
-----
Once the nodejs application is launched, you just have to plug your gamepad controller by connecting your device on the same local network and by reaching the address *http://node_server_adress*
