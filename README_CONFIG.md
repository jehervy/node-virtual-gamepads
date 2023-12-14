About config.json
=================

You can customize the behaviour of the program by changing the values in
`config.json`. This document explains what the single fields will do.

  * `port`: sets the port the web-server is listening on.
  * `useGamepadByDefault`: if set to `false`, `/` will redirect to a
    page where one of gamepad, keyboard, or touchpad can be chosen.
    If set to `true`, `/` redirects to the gamepad. The input-selection
    page can still be accessed via `/index.html`.
  * `analog`: if set to `true` the above-mentioned redirection will
    append `?analog` to the address. This flag will cause the gamepad's
    d-pad to act like an analog stick instead of d-pad.
  * `logLevel`: set it to `"debug"` to get a lot more logging output,
    to `"warning"` to only get critical output, or even to `"error"` if
    you want to only get errors logged (not recommended).
  * `ledBitFieldSequence`: must be an array of 'bit fields'. The length of the
    array will determine how many controllers can connect to the server while
    the bit field values will set what LED-combination of the controllers will
    be lit. The bit fields are numbers from 0-15, resulting in the following LED
    arrangements:
    ```
     0 - ....
     1 - *...
     2 - .*..
     3 - **..
     4 - ..*.
     5 - *.*.
     6 - .**.
     7 - ***.
     8 - ...*
     9 - *..*
    10 - .*.*
    11 - **.*
    12 - ..**
    13 - *.**
    14 - .***
    15 - ****
    ```
    Example: `ledBitFieldSequence = [1, 12]` will allow at most two controllers
    to connect. The first controller will have only the first LED lit (`*...`)
    and the second controller will have the last two LEDs lit (`..**`).
