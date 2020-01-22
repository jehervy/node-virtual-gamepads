/***********************
 INITIALIZE THE JOYSTICK
 **********************/
var localStorageAvailable = (typeof(Storage) !== "undefined");

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
        var gamepad = controllers[Object.keys(controllers)[0]] || null;
        if (analog) {
            /************
            JOYSTICK MODE
             ***********/
            if (joystick.left() || joystick.right() || joystick.up() || joystick.down()
                    || (gamepad != null && (gamepad.xAxis || gamepad.yAxis))) {
                lastDirection = "dir";
                var xy = {
                    x: Math.round(127*(joystick.deltaX()/50 + 1)),
                    y: Math.round(127*(joystick.deltaY()/50 + 1))
                };
                if (gamepad != null && (gamepad.xAxis || gamepad.yAxis)) {
                    if (gamepad.xAxis != null) xy.x = Math.round(255.9999 * (gamepad.xAxis + 1) / 2 - .5);
                    if (gamepad.yAxis != null) xy.y = Math.round(255.9999 * (gamepad.yAxis + 1) / 2 - .5);
                }
                setDirection(xy);
            } else if (lastDirection != "none"){
                lastDirection = "none";
                setDirection({x: 127, y: 127});
            }
        } else {
            /************
             DIRECTIONAL PAD MODE
             ***********/

            if (gamepad && gamepad.dpadState && gamepad.dpadState !== "") {
                setDirection({direction: gamepad.dpadState});
            } else {
                var direction = "";
                if (joystick.left()) direction += "l";
                if (joystick.up()) direction += "u";
                if (joystick.right()) direction += "r";
                if (joystick.down()) direction += "d";
                setDirection({direction: direction})
            }
        }
    }, 1/30 * 1000);
};

/*************************
 INITIALIZE REBIND MODAL
 ************************/
var rebindModal;
$(function () {
    var $rebindModal =  $("#rebind-modal");
    var $skipBtn = $rebindModal.find('.skipBtn');
    var $content = $rebindModal.find('.content');
    var $initContent = $rebindModal.find(".init-content");
    var $calibContent = $rebindModal.find(".calibration-content");
    var isOpen = false;
    var newButtonMap = {};

    var states = [
        {},  // init state
        {},  // calibration state
        {type: 'button', text: '<p>Press <code>UP</code> on the D-Pad', mapName: 'dpadUP'},
        {type: 'button', text: '<p>Press <code>RIGHT</code> on the D-Pad', mapName: 'dpadRIGHT'},
        {type: 'button', text: '<p>Press <code>DOWN</code> on the D-Pad', mapName: 'dpadDOWN'},
        {type: 'button', text: '<p>Press <code>LEFT</code> on the D-Pad', mapName: 'dpadLEFT'},
        {type: 'button', text: '<p>Press the <code>X</code> Button (top button)', mapName: 'btnX'},
        {type: 'button', text: '<p>Press the <code>A</code> Button (right button)', mapName: 'btnA'},
        {type: 'button', text: '<p>Press the <code>B</code> Button (bottom button)', mapName: 'btnB'},
        {type: 'button', text: '<p>Press the <code>Y</code> Button (left button)', mapName: 'btnY'},
        {type: 'button', text: '<p>Press the <code>SELECT</code> Button', mapName: 'btnSELECT'},
        {type: 'button', text: '<p>Press the <code>START</code> Button', mapName: 'btnSTART'},
        {type: 'button', text: '<p>Press the <code>L</code> Button (left shoulder button)', mapName: 'btnLT'},
        {type: 'button', text: '<p>Press the <code>R</code> Button (right shoulder button)', mapName: 'btnRT'},
        {type: 'axis', text: '<p>Move the analog stick <code>right</code>', mapName: 'x'},
        {type: 'axis', text: '<p>Move the analog stick <code>down</code>', mapName: 'y'}
    ];

    var state = 0;

    rebindModal = {
        open: function() {
            state = 0;
            $skipBtn.hide();
            $calibContent.hide();
            $initContent.show();
            $rebindModal.removeClass('closed');
            isOpen = true;
        },
        close: function () {
            $rebindModal.addClass('closed');
            isOpen = false;
        },
        isOpen: function () {
            return isOpen;
        },
        gamepadNewButtonPress: function(buttonId) {
            if (state < 2) return;
            if (states[state].type !== 'button') return;
            newButtonMap[buttonId] = states[state].mapName;
            advanceState();
        },
        gamepadNewAxisActivity: function (axisId, sign) {
            if (state < 2) return;
            if (states[state].type === 'axis') {
                if (sign > 0) {
                    newButtonMap['axis' + axisId] = states[state].mapName;
                } else {
                    newButtonMap['axis' + axisId] = '-' + states[state].mapName;
                }
            } else {
                if (!newButtonMap['axis' + axisId]) {
                    newButtonMap['axis' + axisId] = [null, null];
                }
                if (sign < 0) {
                    newButtonMap['axis' + axisId][0] = states[state].mapName;
                } else {
                    newButtonMap['axis' + axisId][1] = states[state].mapName;
                }
            }
            advanceState();
        }
    };

    function advanceState() {
        if (state === states.length - 1) {
            buttonMap = newButtonMap;
            if (localStorageAvailable) {
                window.localStorage.setItem('gamepadButtonMap', JSON.stringify(buttonMap));
            }
            rebindModal.close();
            return;
        }
        state++;
        switch (state) {
            case 1:
                // start new button binding
                newButtonMap = {};
                $initContent.hide();
                $calibContent.show();
                break;
            case 2:
                $calibContent.hide();
                $skipBtn.show();
                // no break!
            default:
                $content.html(states[state].text);
        }
    }

    $rebindModal.find('.noBtn').click(function(e) {
        e.preventDefault();
        rebindModal.close();
    });

    $rebindModal.find('.yesBtn').click(function(e) {
        e.preventDefault();
        advanceState();
    });

    $rebindModal.find('.close').click(function(e) {
        e.preventDefault();
        rebindModal.close();
    });

    $calibContent.find('button').click(function(e) {
        e.preventDefault();
        freezeAxesRest();
        advanceState();
    });

    $skipBtn.click(function (e) {
        e.preventDefault();
        advanceState();
    })
});

/*************************
 INITIALIZE GAMEPADS
 ************************/

var controllers = {};

var buttonMap = (
  (localStorageAvailable
    && JSON.parse(window.localStorage.getItem('gamepadButtonMap') || "null"))
  || {
    0: "btnX",
    1: "btnA",
    2: "btnB",
    3: "btnY",
    4: "btnLT",
    5: "btnRT",
    8: "btnSELECT",
    9: "btnSTART",
    12: "dpadUP",
    13: "dpadRIGHT",
    14: "dpadDOWN",
    15: "dpadLEFT",
    "axis0": "y",
    "axis1": "-x"
  }
);

var axesNormalizeStats = (localStorageAvailable && JSON.parse(window.localStorage.getItem('gamepadAxesNormalizeStats') || "null") || {});
function normalizeAxis(axisId, value) {
    var changed = false;
    if (!axesNormalizeStats[axisId]) {
        axesNormalizeStats[axisId] = {min: value, max: value, rest: value};
        changed = true;
    }
    if (value < 0 && value < axesNormalizeStats[axisId].min ) {
        axesNormalizeStats[axisId].min = value;
        changed = true;
    } else if (value > 0 && value > axesNormalizeStats[axisId].max ) {
        axesNormalizeStats[axisId].max = value;
        changed = true;
    }
    if (changed && localStorageAvailable) {
        window.localStorage.setItem('gamepadAxesNormalizeStats', JSON.stringify(axesNormalizeStats));
    }
    var stat = axesNormalizeStats[axisId];
    if (stat.max !== stat.min) {
        var deadZoneMax = stat.rest + (stat.max - stat.rest) * 0.075;
        var deadZoneMin = stat.rest - (stat.rest - stat.min) * 0.075;
        if (deadZoneMax >= value && value >= deadZoneMin) {
            return 0
        } else if (value > deadZoneMax) {
            if (stat.max === stat.rest) return 1;
            return (value - deadZoneMax) / (stat.max - deadZoneMax)
        } else {
            if (stat.min === stat.rest) return -1;
            return (value - deadZoneMin) / (deadZoneMin - stat.min)
        }
    } else {
        return stat.max
    }
}
function freezeAxesRest() {
    var controller = controllers[Object.keys(controllers)[0]];
    if (!controller) return;
    for (var axisIdx in axesNormalizeStats) {
        var axis = controller.axes[axisIdx];
        if (axis == null) continue;
        axesNormalizeStats[axisIdx].rest = axis;
    }
    if (localStorageAvailable) {
        window.localStorage.setItem('gamepadAxesNormalizeStats', JSON.stringify(axesNormalizeStats));
    }
}

var wasPressedRaw = {buttons: {}, axes: {}};
var wasPressedMapped = {};

function handleGamepadButton(controller, mapName, pressed) {
    if (mapName == null) return;
    if (pressed) {
        //check for dpad buttons
        switch (mapName) {
            case "dpadUP":
                controller.dpadState += "u";
                break;
            case "dpadRIGHT":
                controller.dpadState += "r";
                break;
            case "dpadDOWN":
                controller.dpadState += "d";
                break;
            case "dpadLEFT":
                controller.dpadState += "l";
                break;
            default:
                $("#" + mapName).trigger('touchstart');
                break;
        }
        wasPressedMapped[mapName] = true;
    } else {
        if (wasPressedMapped[mapName]) {
            if (!mapName.startsWith("dpad")) {
                $("#" + mapName).trigger('touchend');
            }
            wasPressedMapped[mapName] = false;
        }
    }
}

function updateStatus() {
    var j, i, val, mapped;
    scangamepads();
    // loop through all controllers
    for (j in controllers) {
        var controller = controllers[j];
        controller.dpadState = "";
        // loop through each button
        for (i = 0; i < controller.buttons.length; i++) {
            mapped = buttonMap[i];
            val = controller.buttons[i];
            var pressed = val === 1;
            if (typeof (val) == "object") {
                pressed = val.pressed || val.pressed || val.touched;
                val = val.value;
            }
            if (rebindModal.isOpen()) {
                if(pressed) {
                    if (!wasPressedRaw.buttons[i]) {
                        rebindModal.gamepadNewButtonPress(i);
                    }
                    wasPressedRaw.buttons[i] = true;
                }
                else {
                    wasPressedRaw.buttons[i] = false;
                }
            } else {
                handleGamepadButton(controller, mapped, pressed);
            }
        }

        for (i = 0; i < controller.axes.length; i++) {
            val = normalizeAxis(i, controller.axes[i]);
            if (rebindModal.isOpen()) {
                if (Math.abs(val) > .5) {
                    if (!wasPressedRaw.axes[i]) {
                        rebindModal.gamepadNewAxisActivity(i, Math.sign(val))
                    }
                    wasPressedRaw.axes[i] = true;
                } else {
                    wasPressedRaw.axes[i] = false;
                }
            } else {
                mapped = buttonMap["axis" + i];
                if (mapped == null) continue;
                if (typeof mapped === "string") {
                    if (mapped.startsWith('-')) val *= -1;
                    controller[mapped.slice(mapped.length-1) + 'Axis'] = val;
                } else {
                    handleGamepadButton(controller, mapped[0], val < -.5);
                    handleGamepadButton(controller, mapped[1], val > .5);
                }
            }
        }
    }
    window.requestAnimationFrame(updateStatus);
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

$(function()  {
    window.addEventListener("gamepadconnected", connecthandler);
    window.addEventListener("gamepaddisconnected", disconnecthandler);
});

var rebindModalOpened = false;

function connecthandler(e) {
    addgamepad(e.gamepad);
}

function addgamepad(gamepad) {
    if (!rebindModalOpened) {
        rebindModal.open();
        rebindModalOpened = true;
    }
    controllers[gamepad.index] = gamepad;
    window.requestAnimationFrame(updateStatus);
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
var ledBitField;
var initSlotIndicator = function () {
    indicatorOn = false;
    var slotAnimationLoop = function () {
        if (ledBitField != undefined) {
            $(".indicator").removeClass("indicatorSelected");
            if (ledBitField & 0b0001) { $("#indicator_1").addClass("indicatorSelected"); }
            if (ledBitField & 0b0010) { $("#indicator_2").addClass("indicatorSelected"); }
            if (ledBitField & 0b0100) { $("#indicator_3").addClass("indicatorSelected"); }
            if (ledBitField & 0b1000) { $("#indicator_4").addClass("indicatorSelected"); }
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
        ledBitField = data.ledBitField;
        console.log("Here I am, and", data)

        $(".btn").off("touchstart touchend");

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
            if (direction.direction != null) {
                direction = direction.direction;
                if (direction.includes('l')) {
                    socket.emit("padEvent", {type: 0x03, code: 0x00, value: 0});
                } else if (direction.includes('r')) {
                    socket.emit("padEvent", {type: 0x03, code: 0x00, value: 255});
                } else {
                    socket.emit("padEvent", {type: 0x03, code: 0x00, value: 127});
                }
                if (direction.includes('u')) {
                    socket.emit("padEvent", {type: 0x03, code: 0x01, value: 0});
                } else if (direction.includes('d')) {
                    socket.emit("padEvent", {type: 0x03, code: 0x01, value: 255});
                } else {
                    socket.emit("padEvent", {type: 0x03, code: 0x01, value: 127});
                }
            } else {
                socket.emit("padEvent", {type: 0x03, code: 0x00, value: direction.x});
                socket.emit("padEvent", {type: 0x03, code: 0x01, value: direction.y});
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
