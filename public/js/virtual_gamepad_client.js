/***********************
 INITIALIZE THE JOYSTICK
 **********************/
var setDirection = function() {};
var initJoystick = function () {
    var dirCursor = document.getElementById("dirCenter");
    var container = document.getElementById("dirContainer");
    var joystickBoundLimit = document.getElementById("path3212");

    var joystick = new VirtualJoystick({
        mouseSupport: true,
        stationaryBase: true,
        baseX: $(dirCursor).position().left,
        baseY: $(dirCursor).position().top,
        limitStickTravel: true,
        stickRadius: 50,
        baseElement: $(dirCursor).clone()[0],
        container: container,
        strokeStyle: '#777f82'
    });

    $(window).resize(function () {
        joystick._baseX = $(dirCursor).position().left;
        joystick._baseY = $(dirCursor).position().top;
    });

    var lastDirection = "none";
    var analog = location.href.match(/\?analog/);
    setInterval(function(){
        if (analog) {
            /************
            JOYSTICK MODE
             ***********/
            if (joystick.left() || joystick.right() | joystick.up() || joystick.down()) {
                lastDirection = "dir";
                var xy = {
                    x: Math.round(127*(joystick.deltaX()/50 + 1)),
                    y: Math.round(127*(joystick.deltaY()/50 + 1))
                };
                setDirection(xy);
            } else if (lastDirection != "none"){
                lastDirection = "none";
                setDirection({x: 127, y: 127});
            }
        } else {
            /************
             DIRECTIONAL PAD MODE
             ***********/

            var gamepad = controllers[Object.keys(controllers)[0]] || {};
            // if(gamepad) console.log(gamepad)
            if(joystick.left() || gamepad.dpadState == "left") {
                if (lastDirection != "left") {
                    lastDirection = "left";
                    setDirection({direction: "left"});
                }
            } else if(joystick.right() || gamepad.dpadState == "right") {
                if (lastDirection != "right") {
                    lastDirection = "right";
                    setDirection({direction: "right"});
                }
            } else if(joystick.up() || gamepad.dpadState == "up") {
                if (lastDirection != "up") {
                    lastDirection = "up";
                    setDirection({direction: "up"});
                }
            } else if(joystick.down() || gamepad.dpadState == "down") {
                if (lastDirection != "down") {
                    lastDirection = "down";
                    setDirection({direction: "down"});
                }
            } else if (lastDirection != "none") {
                lastDirection = "none";
                setDirection({direction: "none"});
            }
        }
    }, 1/30 * 1000);
};

/*************************
 INITIALIZE GAMEPADS
 ************************/
var controllers = {};
var rAF = window.requestAnimationFrame;

var buttonMap = {
    0: "btnX",
    1: "btnA",
    2: "btnB",
    3: "btnY",
    4: "btnLT",
    5: "btnRT",
    6: "btnLTT",
    7: "btnRTT",
    8: "btnSELECT",
    9: "btnSTART",
}

var wasPressed = [];

function updateStatus() {
    scangamepads();
    // loop through all controllers
    for (j in controllers) {
        var controller = controllers[j];
        // loop through each button
        for (var i = 0; i < controller.buttons.length; i++) {
            var val = controller.buttons[i];
            var pressed = val == 1.0;
            if (typeof (val) == "object") {
                pressed = val.pressed;
                val = val.value;
            }
            if (pressed) {
                //check for dpad buttons
                switch (i) {
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
                        $("#" + buttonMap[i]).trigger('touchstart');
                        wasPressed[i] = true;
                        break;
                }
            } else {
                if (wasPressed[i]) {
                    $("#" + buttonMap[i]).trigger('touchend');
                    wasPressed[i] = false;
                }
            }
        }

        for (var i = 0; i < controller.axes.length; i++) {
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

window.addEventListener("gamepadconnected", connecthandler);
window.addEventListener("gamepaddisconnected", disconnecthandler);

function connecthandler(e) {
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

/*************************
 INITIALIZE SLOT INDICATOR
 ************************/
var indicatorOn;
var slotNumber;
var initSlotIndicator = function () {
    indicatorOn = false;
    var slotAnimationLoop = function () {
        if (slotNumber != undefined) {
            $(".indicator").removeClass("indicatorSelected");
            $("#indicator_"+(slotNumber+1)).addClass("indicatorSelected");
        } else {
            if(indicatorOn) {
                $(".indicator").removeClass("indicatorSelected");
            } else {
                $(".indicator").addClass("indicatorSelected");
            }
            indicatorOn = !indicatorOn;
            setTimeout(slotAnimationLoop, 500);
        }
    }
    slotAnimationLoop();
}

/**********************
 HAPTIC CALLBACK METHOD
 *********************/
navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
var hapticCallback = function () {
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
};

/****************
 MAIN ENTRY POINT
 ***************/
$( window ).load(function() {
    initJoystick();
    initSlotIndicator();

    var socket = io();

    socket.on("gamepadConnected", function(data) {
        slotNumber = data.padId;

        $(".btn").off("touchstart touchend");
        setDirection = function(){};

        $(".btn").on("touchstart", function() {
            btnId = $(this).data("btn");
            $("#"+btnId).attr("class", "btnSelected");
            socket.emit("padEvent", {type: 0x01, code: $(this).data("code"), value: 1});
            hapticCallback();
        });

        $(".btn").on("touchend", function() {
            btnId = $(this).data("btn");
            $("#"+btnId).attr("class", "");
            socket.emit("padEvent", {type: 0x01, code: $(this).data("code"), value: 0});
            //hapticCallback();
        });

        setDirection = function(direction) {
            switch (direction.direction) {
                case "left" :
                    socket.emit("padEvent", {type: 0x03, code: 0x00, value: 0});
                    socket.emit("padEvent", {type: 0x03, code: 0x01, value: 127});
                    break;
                case "right" :
                    socket.emit("padEvent", {type: 0x03, code: 0x00, value: 255});
                    socket.emit("padEvent", {type: 0x03, code: 0x01, value: 127});
                    break;
                case "up" :
                    socket.emit("padEvent", {type: 0x03, code: 0x00, value: 127});
                    socket.emit("padEvent", {type: 0x03, code: 0x01, value: 0});
                    break;
                case "down" :
                    socket.emit("padEvent", {type: 0x03, code: 0x00, value: 127});
                    socket.emit("padEvent", {type: 0x03, code: 0x01, value: 255});
                    break;
                case "none" :
                    socket.emit("padEvent", {type: 0x03, code: 0x00, value: 127});
                    socket.emit("padEvent", {type: 0x03, code: 0x01, value: 127});
                    break;
                default :
                    socket.emit("padEvent", {type: 0x03, code: 0x00, value: direction.x});
                    socket.emit("padEvent", {type: 0x03, code: 0x01, value: direction.y});
                    break;
            }
        };

        setDirection({direction: "none"});

    });

    socket.on("connect", function() {
        socket.emit("connectGamepad", null);
    });

    socket.on("disconnect", function() {
        location.reload();
    });
} );
