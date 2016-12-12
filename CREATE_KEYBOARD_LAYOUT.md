Creating a new Keyboard Layout
==============================
This document will first explain a the process of creating a new keyboard layout
in a technical way. After that an example on how to do that with Inkscape
(a free vector graphic editing software) is given.


Technical View
--------------
### SVG Structure ###
A keyboard layout is an svg file that contains one group that represents the
whole keyboard. Inside that group you may place as many groups as wanted
representing keys but no further groups.

### IDs of Key Groups ###
Each key group must have an id that
represents the keyCode (see below on how to get them). If the key is a modifier
key (e.g. Ctrl) prepend 'm' in front of the keyCode (e.g. m100). Modifier keys
are such keys that usually have no effect if pressed alone but only in
combination with other keys.

### How to get the keyCodes ###
If you're running a Linux system run `sudo showkey`. Then stroke the keys on
your keyboard.

### Update the JavaScript ###
Open public/js/keyboard/settings.js with the editor of you choice. Add your new
keyboard layout to the `ALL_KEYBOARDS` object. Example if there was only the
`us-US` layout and you added the `de-DE` layout, the file should change from

    var ALL_KEYBOARDS = {
        'en-US': 'en-US.svg'
    };
    
to

    var ALL_KEYBOARDS = {
        'en-US': 'en-US.svg',
        'de-DE': 'de-DE.svg'
    };

where the key (left side of colon) is the name of the layout while the value
(right side of colon) is the file name layout svg you just created under
`public/images/keyboards`. HINT: don't forget the commas between the lines.

With Inkscape
-------------
Assumption: You have forked and cloned the repository.

  * Install Inkscape. Please check out their site
    [https://inkscape.org/](https://inkscape.org/) for more detail.
  * Go to `public/images/keyboards` under the project's path
  * Copy an existing keyboard close to the one you want to create.
    Or create a new svg file there. Please name it appropriately.
  * Open the file with Inkscape.
  * Modify the file as needed (don't use layers!)
    * Some tips for editing:
    * The whole keyboard is grouped. Ungroup it (Ctrl+Shift+G)
    * Tip: The font used is `Nimbus Sans L`
  * Convert all text to path (Select it and hit Ctrl+Shift+C)
  * Make sure each key is a group:
    * Select all parts of key and hit Ctrl+G
  * Go through the key groups from top left to top right (as you would read)
    * Select it (by clicking)
    * Press `End` key to lower the group to the bottom.
      This will bring the keys in a proper order an will make any
      debugging in the future much easier.
    * Open object properties (Ctrl+Shift+O)
    * Edit the id field according to the instructions above under
      ["Technical View" > "IDs of key groups"](#ids-of-key-groups)
  * Select the whole keyboard and group it (Ctrl+G again)
  * "save file as" (Ctrl+Shift+S)
  * select file type "Plain SVG"
  * overwrite your newly created file
  * Follow the instructions under
    ["Technical View" > "Update the JavaScript"](#update-the-javascript)
  * Test your layout!
  * Create a pull request =)
  * Thank you for your support!
  


