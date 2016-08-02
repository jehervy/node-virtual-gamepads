Troubleshooting
===============

npm install
-----------
If you get errors on

    npm install

try

    sudo apt-get install nodejs-legacy
    sudo npm install



Error: EINVAL, invalid argument
-------------------------------
If you get errors on running

    sudo node main.js

that look something like

    Missing error handler on `socket`.
    Error: EINVAL, invalid argument

this may be caused by running on ubuntu or a system that does not come with
header-files (dev-packages) pre-installed. Try:

    sudo apt-get install libudev-dev

