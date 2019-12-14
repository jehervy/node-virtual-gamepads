/*
 * Gamepad API Test
 * Written in 2013 by Ted Mielczarek <ted@mielczarek.org>
 *
 * To the extent possible under law, the author(s) have dedicated all copyright and related and neighboring rights to this software to the public domain worldwide. This software is distributed without any warranty.
 *
 * You should have received a copy of the CC0 Public Domain Dedication along with this software. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
 */
var haveEvents = 'GamepadEvent' in window;
var haveWebkitEvents = 'WebKitGamepadEvent' in window;
var controllers = {};
var rAF = window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.requestAnimationFrame;

function connecthandler(e) {
    console.log("Connected")
  addgamepad(e.gamepad);
}
function addgamepad(gamepad) {
  controllers[gamepad.index] = gamepad;
  rAF(updateStatus);
}

function disconnecthandler(e) {
  removegamepad(e.gamepad);
}

function removegamepad(gamepad) {
  delete controllers[gamepad.index];
}

var buttonMap = {
  0: "btnX",
  1: "btnA",
  2: "btnB",
  3: "btnY",
  4: "btnLT",
  5: "btnRT",
  8: "btnSELECT",
  9: "btnSTART",
}

var wasPressed = [];

function updateStatus() {
  scangamepads();
  for (j in controllers) {
    var controller = controllers[j];
    for (var i=0; i<controller.buttons.length; i++) {
      var val = controller.buttons[i];
      var pressed = val == 1.0;
      if (typeof(val) == "object") {
        pressed = val.pressed;
        val = val.value;
      }
      if (pressed) {
        switch(i){
          case 12:
            controller.dpadState = "up";
            break;
          case 13:
          controller.dpadState = "right";
            break;
          case 14:
          controller.dpadState = "down";
            break;
          case 15:
          controller.dpadState = "left";
            break;
          default:
            $("#"+buttonMap[i]).trigger('touchstart');
            wasPressed[i]=true;
            break;
        }
      } else {
        if(wasPressed[i]){
          $("#"+buttonMap[i]).trigger('touchend');
          wasPressed[i]=false;
        }
      }
    }

    for (var i=0; i<controller.axes.length; i++) {
      var a = controller.axes[i];
    }
  }
  rAF(updateStatus);
}

function scangamepads() {
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
  for (var i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) {
      if (!(gamepads[i].index in controllers)) {
        addgamepad(gamepads[i]);
      } else {
        controllers[gamepads[i].index] = gamepads[i];
      }
    }
  }
}

if (haveEvents) {
  window.addEventListener("gamepadconnected", connecthandler);
  window.addEventListener("gamepaddisconnected", disconnecthandler);
} else if (haveWebkitEvents) {
  window.addEventListener("webkitgamepadconnected", connecthandler);
  window.addEventListener("webkitgamepaddisconnected", disconnecthandler);
} else {
  setInterval(scangamepads, 500);
}
