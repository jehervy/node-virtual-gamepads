Troubleshooting
===============

npm install
-----------
If you get errors on

    npm install

make sure you have node version 9 or higher installed.
If you open an issue please provide version numbers for both nodejs and npm and
state what OS (including version) you're working with.

### installing `ioctl` fails
Errors along the line of
```
ValueError: invalid mode: 'rU' while trying to load binding.gyp
```
can occur if you have Python 3.11 or newer installed while running on older node verions.
Try downgrading to Python 3.10 or older or upgrading nodejs.


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


Nothing helped
--------------
If nothing helped see if you can find you problem in the
[issue section](https://github.com/miroof/node-virtual-gamepads/issues?utf8=%E2%9C%93&q=).  
Still no solution? Open an issue.
