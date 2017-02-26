var TOUCHPAD = 'touchpad';

var JOYSTICK = 'joystick';

var settings = function () {

    var settings = {};

    /*
     * Settings modal stuff
     */

    settings.modal = {};
    settings.modal.isOpen = false;

    // initialize settings modal
    $(document).ready(function () {
        var settingsModal = $("#settings-modal");

        $('#settings-speed').on('input', function () {
            $('#settings-speed-output').val($(this).val());
        });
        $('#settings-acceleration').on('input', function () {
            $('#settings-acceleration-output').val($(this).val());
        });

        settings.modal.open = function () {
            settingsModal.removeClass('closed');
            settings.modal.isOpen = true;
        };
        settings.modal.close = function () {
            settingsModal.addClass('closed');
            settings.modal.isOpen = false;
        };

        function initDialog() {
            $('#settings-speed').val(settings.speed);
            $('#settings-speed-output').val(settings.speed);
            $('#settings-acceleration').val(settings.acceleration);
            $('#settings-acceleration-output').val(settings.acceleration);
        }

        function bindSubmit() {
            $('#settings-form').submit(function (event) {
                var formData = {};
                $(this).find(':input').each(function (i, e) {
                    e = $(e);
                    var name = e.attr('name');
                    if (name == null) return;
                    var val;
                    if (e.attr('type') == 'checkbox') {
                        val = e.prop('checked');
                    } else {
                        val = e.val();
                    }
                    formData[name] = val;
                });
                settings.update(formData);
                settings.modal.close();
                event.preventDefault();
                event.stopPropagation();
            })
        }

        function bindClose() {
            settingsModal.find(".close").addBack().click(function (event) {
                settings.modal.close();
            });
            $(".modal").click(function (event) {
                event.stopPropagation();
            });
        }

        initDialog();
        bindClose();
        bindSubmit();
    });

    /*
     * Rest of the settings
     */

    var localStorageAvailable = (typeof(Storage) !== "undefined");

    settings.speed = null;
    settings.acceleration = null;

    settings.update = function(update) {
        if (update.hasOwnProperty('speed')) settings.speed = parseFloat(update.speed);
        if (update.hasOwnProperty('acceleration')) settings.acceleration = parseFloat(update.acceleration);
        if (localStorageAvailable) {
            window.localStorage.setItem('touchpadSettings', JSON.stringify({
                speed: settings.speed,
                acceleration: settings.acceleration
            }));
        }
    };

    function defaultSettings() {
        return {
            speed: 2,
            acceleration: 1.5
        }
    }

    function init() {
        if (localStorageAvailable) {
            var touchpadSettings = window.localStorage.getItem("touchpadSettings");
            if (touchpadSettings == null) {
                touchpadSettings = defaultSettings();
            } else {
                touchpadSettings = JSON.parse(touchpadSettings);
            }
            settings.update(touchpadSettings);
        } else {
            console.error('localStorage not available. Settings can\'t be stored.')
        }
    }

    init();

    return settings;
}();


var app = {

    clicks: 0,

    drag: 0,

    touches: 0,

    toucheindex: 0,

    touchmove: 0,

    current_x: 0,

    current_y: 0,

    current_device: TOUCHPAD,

    socket: null,

    createJoystickClient: function (options) {
        var menu_height = document.querySelector('body menu').clientHeight;

        var stick = new Joystick.CircuralStick({
            start: function (coords) {
            },
            move: function (abs_coords, rel_coords) {
                app.emit(["touchpadEvent", 3 /*'EV_ABS'*/, 0 /*'ABS_X'*/, rel_coords.x],
                    ["touchpadEvent", 3 /*'EV_ABS'*/, 1 /*'ABS_Y'*/, rel_coords.y]);
            },
            end: function () {
            },
            analog: true,
            axis_value: 0x7FFF,
            x: document.body.clientWidth / 4,
            y: document.body.clientHeight / 2 + menu_height,
            container: document.getElementById('joystick'),
            autohide: false,
            targeting: true,
            region: function () {
                return [0, menu_height, document.body.clientWidth / 2, document.body.clientHeight]
            }
        });

        var buttons = new Joystick.Buttons({
            x: document.body.clientWidth / 2 + document.body.clientWidth / 4,
            y: document.body.clientHeight / 2,
            container: document.getElementById('joystick'),

            down: function (btn) {
                var code;
                switch (btn) {
                    case 'button_x' :
                        code = 0x133;
                        /*'BTN_X'*/
                        break;
                    case 'button_y' :
                        code = 0x134;
                        /*'BTN_Y'*/
                        break;
                    case 'button_a' :
                        code = 0x130;
                        /*'BTN_A'*/
                        break;
                    case 'button_b' :
                        code = 0x131;
                        /*'BTN_B'*/
                        break;
                }
                if (code) {
                    app.emit("touchpadEvent", 1 /*'EV_KEY'*/, code, 1);
                }
            },

            up: function (btn) {
                var code;
                switch (btn) {
                    case 'button_x' :
                        code = 0x133;
                        /*'BTN_X'*/
                        break;
                    case 'button_y' :
                        code = 0x134;
                        /*'BTN_Y'*/
                        break;
                    case 'button_a' :
                        code = 0x130;
                        /*'BTN_A'*/
                        break;
                    case 'button_b' :
                        code = 0x131;
                        /*'BTN_B'*/
                        break;
                }
                if (code) {
                    app.emit("touchpadEvent", 1 /*'EV_KEY'*/, code, 0);
                }
            },

            region: function () {
                return [document.body.clientWidth / 2, menu_height, document.body.clientWidth / 2, document.body.clientHeight]
            }
        });

        window.addEventListener('resize', function () {
            buttons.setPosition(document.body.clientWidth / 2 + document.body.clientWidth / 4, document.body.clientHeight / 2);
        })
    },

    createTouchpadClient: function (options) {
        options.btn_left && options.btn_left.addEventListener('touchstart', function () {
            if (app.drag == 0) {
                app.emit("touchpadEvent", 1 /*'EV_KEY'*/, 0x110 /*'BTN_LEFT'*/, 1);
            }
            app.clicks += 1;
        });
        options.btn_left && options.btn_left.addEventListener('touchend', function () {
            if (app.drag == 0) {
                app.emit("touchpadEvent", 1 /*'EV_KEY'*/, 0x110 /*'BTN_LEFT'*/, 0);
            }
            app.clicks -= 1;
        });

        options.btn_right && options.btn_right.addEventListener('touchstart', function () {
            app.emit("touchpadEvent", 1 /*'EV_KEY'*/, 0x111 /*'BTN_RIGHT'*/, 1);
            app.clicks += 2;
        });
        options.btn_right && options.btn_right.addEventListener('touchend', function () {
            app.emit("touchpadEvent", 1 /*'EV_KEY'*/, 0x111 /*'BTN_RIGHT'*/, 0);
            app.clicks -= 2;
        });

        options.area && options.area.addEventListener('touchstart', function (e) {
            e.preventDefault();
            // do not count touches into the mouse button areas
            app.touches = e.touches.length - (app.clicks & 1) - ((app.clicks & 2) >> 1);
            app.touchindex = e.touches.length - 1;
            app.touchmove = 0;
            app.current_x = e.touches[app.touchindex].pageX;
            app.current_y = e.touches[app.touchindex].pageY;
        });

        options.area && options.area.addEventListener('touchmove', function (e) {
            e.preventDefault();
            if (app.touchindex + 1 > e.touches.length) {
                app.touchindex = e.touches.length - 1;
            } else {
                var x = e.touches[app.touchindex].pageX - app.current_x;
                var y = e.touches[app.touchindex].pageY - app.current_y;
                x = (x >= 0 ? 1.0 : -1.0) * Math.pow(Math.abs(settings.speed * x), settings.acceleration);
                y = (y >= 0 ? 1.0 : -1.0) * Math.pow(Math.abs(settings.speed * y), settings.acceleration);
                if (app.touches >= 3) {
                    // drag and drop
                    if (app.drag == 0 && (app.clicks & 1) == 0) {
                        app.emit("touchpadEvent", 1 /*'EV_KEY'*/, 0x110 /*'BTN_LEFT'*/, 1);
                    }
                    app.drag = 1;
                    app.emit(
                        ["touchpadEvent", 2 /*'EV_REL'*/, 0 /*'REL_X'*/, x],
                        ["touchpadEvent", 2 /*'EV_REL'*/, 1 /*'REL_Y'*/, y]
                    );
                } else if (app.touches == 2) {
                    app.emit(
                        ["touchpadEvent", 2 /*'EV_REL'*/, 8 /*'REL_WHEEL' */, -x],
                        ["touchpadEvent", 2 /*'EV_REL'*/, 6 /*'REL_HWHEEL'*/, -y]
                    );
                } else {
                    app.emit(
                        ["touchpadEvent", 2 /*'EV_REL'*/, 0 /*'REL_X'*/, x],
                        ["touchpadEvent", 2 /*'EV_REL'*/, 1 /*'REL_Y'*/, y]
                    );
                }
            }
            app.current_x = e.touches[app.touchindex].pageX;
            app.current_y = e.touches[app.touchindex].pageY;
            app.touchmove = 1;
        });

        options.area && options.area.addEventListener('touchend', function (e) {
            e.preventDefault();
            if (app.touchmove == 1) {
                // end of a touchmove
                if (app.drag == 1 && (app.clicks & 1) == 0) {
                    // end a drag and drop move
                    app.emit("touchpadEvent", 1 /*'EV_KEY'*/, 0x110 /*'BTN_LEFT'*/, 0);
                }
                app.drag = 0;
            } else if (app.clicks == 0) {
                // There are no clicks in the mouse button areas,
                // only in this case register a tap on the touchpad as a mouse click.
                if (app.touches == 1) {
                    app.emit(
                        ["touchpadEvent", 1 /*'EV_KEY'*/, 0x110 /*'BTN_LEFT'*/, 1],
                        ["touchpadEvent", 1 /*'EV_KEY'*/, 0x110 /*'BTN_LEFT'*/, 0]
                    );
                } else if (app.touches == 2) {
                    app.emit(
                        ["touchpadEvent", 1 /*'EV_KEY'*/, 0x111 /*'BTN_RIGHT'*/, 1],
                        ["touchpadEvent", 1 /*'EV_KEY'*/, 0x111 /*'BTN_RIGHT'*/, 0]
                    );
                } else if (app.touches == 3) {
                    app.emit(
                        ["touchpadEvent", 1 /*'EV_KEY'*/, 0x112 /*'BTN_MIDDLE'*/, 1],
                        ["touchpadEvent", 1 /*'EV_KEY'*/, 0x112 /*'BTN_MIDDLE'*/, 0]
                    );
                } else if (app.touches >= 4) {
                    app.emit(
                        ["touchpadEvent", 1 /*'EV_KEY'*/, 0x113 /*'BTN_SIDE'*/, 3],
                        ["touchpadEvent", 1 /*'EV_KEY'*/, 0x113 /*'BTN_SIDE'*/, 3]
                    );
                }
            }
            app.touches = 0;
        });
    },

    emit: function () {
        if (!(arguments[0] instanceof Array)) {
            app.emit.call(this, Array.prototype.slice.call(arguments));
            return;
        }

        Array.prototype.slice.call(arguments).forEach(function (ev) {
            app.socket && app.socket.emit(ev[0], {
                type: ev[1],
                code: ev[2],
                value: ev[3]
            });
        })
    },

    init: function () {
        app.createJoystickClient({
            area: document.getElementById('touchpad-area')
        });

        app.createTouchpadClient({
            area: document.getElementById('touchpad-area'),
            btn_left: document.getElementById('touchpad-btn_left'),
            btn_right: document.getElementById('touchpad-btn_right')
        });

        var touchpad_screen = document.getElementById('touchpad'),
            joystick_screen = document.getElementById('joystick');

        document.getElementById('goFullscreen').addEventListener('click', function () {
            app.toggleFullScreen();
        });
        document.getElementById('goFullscreen').addEventListener('touchend', function () {
            app.toggleFullScreen();
        });

        document.getElementById('setTouchpad').addEventListener('click', function () {
            joystick_screen.style.display = 'none';
            touchpad_screen.style.display = 'block';
            app.current_device = TOUCHPAD;
        });
        document.getElementById('setTouchpad').addEventListener('touchend', function () {
            joystick_screen.style.display = 'none';
            touchpad_screen.style.display = 'block';
            app.current_device = TOUCHPAD;
        });

        document.getElementById('setJoystick').addEventListener('click', function () {
            joystick_screen.style.display = 'block';
            touchpad_screen.style.display = 'none';
            app.current_device = JOYSTICK;
        });
        document.getElementById('setJoystick').addEventListener('touchend', function () {
            joystick_screen.style.display = 'block';
            touchpad_screen.style.display = 'none';
            app.current_device = JOYSTICK;
        });
        document.getElementById('gear-svg').addEventListener('click', function () {
            settings.modal.open();
        });

        !function connect() {
            app.socket = io();

            app.socket.on("touchpadConnected", function (data) {
                slotNumber = data.touchpadId;
                document.getElementById('connecting').style.display = 'none';
            });

            app.socket.on("connect", function () {
                app.socket.emit("connectTouchpad", null);
                document.getElementById('connecting').style.display = 'block';
            });

            app.socket.on("disconnect", function () {
                location.reload();
            });
        }();
    },

    // Code from https://developer.mozilla.org/en-US/docs/Web/Guide/DOM/Using_full_screen_mode
    // because I'm to lazy...
    toggleFullScreen: function () {
        if (!document.fullscreenElement &&    // alternative standard method
            !document.mozFullScreenElement && !document.webkitFullscreenElement) {  // current working methods
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        } else {
            if (document.cancelFullScreen) {
                document.cancelFullScreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
        }
    }
};
