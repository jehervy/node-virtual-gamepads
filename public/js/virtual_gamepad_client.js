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

             var gamepad = controllers[Object.keys(controllers)[0]];
            if(joystick.left() || gamepad.depadState == "left") {
                if (lastDirection != "left") {
                    lastDirection = "left";
                    setDirection({direction: "left"});
                }
            } else if(joystick.right() || gamepad.depadState == "right") {
                if (lastDirection != "right") {
                    lastDirection = "right";
                    setDirection({direction: "right"});
                }
            } else if(joystick.up() || gamepad.depadState == "up") {
                if (lastDirection != "up") {
                    lastDirection = "up";
                    setDirection({direction: "up"});
                }
            } else if(joystick.down() || gamepad.depadState == "down") {
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
