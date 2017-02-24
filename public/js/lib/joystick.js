(function (global) {

    // Modified polyfill for requesAnimationFrame
    // requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
    // MIT license
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'], requestAnimationFrame, cancelAnimationFrame;

    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
            || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!requestAnimationFrame)
        requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!cancelAnimationFrame)
        cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };


    /*******************************************************************/


    var TOUCH_SUPPORT = "ontouchstart" in document.documentElement;

    var START = TOUCH_SUPPORT ? 'touchstart' : 'mousedown',
        MOVE = TOUCH_SUPPORT ? 'touchmove' : 'mousemove',
        END = TOUCH_SUPPORT ? 'touchend' : 'mouseup',
        DOWN = TOUCH_SUPPORT ? 'touchstart' : 'mousedown',
        UP = TOUCH_SUPPORT ? 'touchend' : 'mouseup';

    var VERT = 'vertical',
        HORZ = 'horizontal',
        CIRC = 'circular';


    var _anim_loops = [], _running = false;

    function loop() {
        requestAnimationFrame(loop);
        for (var i = 0; i < _anim_loops.length; ++i) _anim_loops[i]();
    }


    var sprite_resource = new Image();
    sprite_resource.src = 'images/sprites.png';

    function extend(a, b) {
        if (typeof a == 'object' && typeof b == 'object') {
            for (var i in b) {
                a[i] = b[i];
            }
        }
    }

    function getCoords(e) {
        return e && e.touches && e.touches[0] ? {
            clientX: e.touches[0].clientX,
            clientY: e.touches[0].clientY,
            pageX: e.touches[0].pageX,
            pageY: e.touches[0].pageY,
            screenX: e.touches[0].screenX,
            screenY: e.touches[0].screenY
        } : {
            clientX: e.clientX,
            clientY: e.clientY,
            pageX: e.pageX,
            pageY: e.pageY,
            screenX: e.screenX,
            screenY: e.screenY
        }
    }

    function getStickPosition(start_pos, current_pos) {
        var dist_x = current_pos[0] - start_pos[0],
            dist_y = current_pos[1] - start_pos[1],
            angle = Math.atan2(dist_y, dist_x),
            distance = Math.sqrt(Math.pow(dist_x, 2) + Math.pow(dist_y, 2));

        distance = distance > this.limit ? this.limit : distance;

        return [Math.cos(angle) * distance, Math.sin(angle) * distance];
    }

    function getStickDistanceFromCenter(start_pos, current_pos) {
        var dist_x = current_pos[0] - start_pos[0],
            dist_y = current_pos[1] - start_pos[1],
            angle = Math.atan2(dist_y, dist_x);

        return Math.sqrt(Math.pow(dist_x, 2) + Math.pow(dist_y, 2));
    }


    function Abstract() {
    }

    Abstract.prototype = {
        init: function () {
            if (this.container) {
                this.canvas = document.createElement('canvas');
                this.ctx = this.canvas.getContext('2d');

                this.canvas.style.position = 'absolute';
                this.canvas.style.left = ( this.x - this.size / 2 ) + 'px';
                this.canvas.style.top = ( this.y - this.size / 2 ) + 'px';

                this.canvas.width = this.canvas.height = this.size;

                this.container.appendChild(this.canvas);

                this.canvas.addEventListener('contextmenu', function (e) {
                    e.preventDefault();
                });
            }

            delete this.init;
        },

        setPosition: function (x, y) {
            this.x = x;
            this.y = y;
            this.canvas.style.left = ( this.x - this.size / 2 ) + 'px';
            this.canvas.style.top = ( this.y - this.size / 2 ) + 'px';
        },

        region: function () {
            return [0, 0, document.width, document.height];
        },

        /**
         @property x
         @type Number
         @default 100
         **/
        x: 100,

        /**
         @property y
         @type Number
         @default 100
         **/
        y: 100,

        /**
         @property canvas
         @type Element
         @default null
         **/
        canvas: null,

        /**
         @property ctx
         @type Object
         @default null
         **/
        ctx: null,

        /**
         @property container
         @type Element
         @default null
         **/
        container: null,

        /**
         @method isInRegion
         @param coords [Object]
         @param clientX [Number]
         @param clientY [Number]
         **/
        isInRegion: function (e) {
            var region = typeof this.region == 'function' ? this.region() : this.region;
            var coords = false;

            var touches = [];

            if (e && e.touches) {
                touches = e.touches;
            } else {
                touches.push(e);
            }

            for (var i = 0; i < touches.length; ++i) {
                var touch = touches[i];
                if (touch.clientX >= region[0] && touch.clientX <= region[0] + region[2] &&
                    touch.clientY >= region[1] && touch.clientY <= region[1] + region[3]) {
                    coords = {
                        pageX: touch.pageX,
                        pageY: touch.pageY,
                        clientX: touch.clientX,
                        clientY: touch.clientY,
                        screenX: touch.screenX,
                        screenY: touch.screenY,
                        id: touch.identifier
                    };
                }
            }

            return coords;
        }
    };


    function Stick(options) {
        var self = new Abstract();

        extend(self, this);
        extend(self, options);

        self.init();

        var _active = false,
            _start_pos = [self.x, self.y],
            _current_pos = [self.x, self.y];

        if (self.autohide) {
            self.canvas.style.display = 'none';
        }

        var _prev_rel = [0, 0];

        function update(coords) {
            var abs_x = _current_pos[0],
                abs_y = _current_pos[1],
                rel_x = _current_pos[0] - _start_pos[0],
                rel_y = _current_pos[1] - _start_pos[1];

            if (!self.analog) {
                if (Math.abs(rel_x) < self.limit / 2) {
                    rel_x = 0;
                } else {
                    rel_x = rel_x != 0 ? rel_x / Math.abs(rel_x) * self.axis_value : 0;
                }

                if (Math.abs(rel_y) < self.limit / 2) {
                    rel_y = 0;
                } else {
                    rel_y = rel_y != 0 ? rel_y / Math.abs(rel_y) * self.axis_value : 0;
                }
            }

            if (_prev_rel[0] != rel_x || _prev_rel[1] != rel_y) {
                self.move({
                    x: self.mode == VERT || self.mode == CIRC ? Math.round(abs_x) : 0,
                    y: self.mode == HORZ || self.mode == CIRC ? Math.round(abs_y) : 0
                }, {
                    x: self.mode == VERT || self.mode == CIRC ? Math.round(rel_x) : 0,
                    y: self.mode == HORZ || self.mode == CIRC ? Math.round(rel_y) : 0
                }, coords);
            }

            _prev_rel[0] = rel_x;
            _prev_rel[1] = rel_y;
        }

        document.getElementById('joystick').addEventListener(START, function (e) {
            e.preventDefault();
            var coords = self.isInRegion(e);
            if (!coords || _active !== false) {
                return;
            }

            _active = coords.id;

            _current_pos[0] = coords.pageX;
            _current_pos[1] = coords.pageY;

            self.show(_current_pos[0], _current_pos[1]);

            self.start({
                x: _current_pos[0],
                y: _current_pos[1]
            }, coords);

            _start_pos[0] = _current_pos[0];
            _start_pos[1] = _current_pos[1];
        });

        document.getElementById('joystick').addEventListener(MOVE, function (e) {
            var coords = self.isInRegion(e);

            if (coords === false || coords.id != _active) {
                return;
            }

            _current_pos[0] = self.mode == VERT ? _current_pos[0] : coords.pageX;
            _current_pos[1] = self.mode == HORZ ? _current_pos[1] : coords.pageY;

            update(coords);
        });

        document.getElementById('joystick').addEventListener(END, function (e) {
            if (e.touches) {
                for (var i = 0; i < e.touches.length; ++i) {
                    if (_active === e.touches[i].identifier) {
                        return;
                    }
                }
            }

            self.autohide && self.hide();

            var point = getStickPosition.call(self, _start_pos, _current_pos);

            _current_pos[0] = _start_pos[0] + point[0];
            _current_pos[1] = _start_pos[1] + point[1];

            self.end();
            _active = false;
        });

        _anim_loops.push(function () {
            if (!_active && _start_pos[0] != Math.round(_current_pos[0]) && _start_pos[1] != Math.round(_current_pos[1])) {
                _current_pos[0] += ( _start_pos[0] - _current_pos[0] ) / self.bounce;
                _current_pos[1] += ( _start_pos[1] - _current_pos[1] ) / self.bounce;

            } else if (!_active) {
                _current_pos[0] = _start_pos[0];
                _current_pos[1] = _start_pos[1];
            }

            self.draw(_start_pos, _current_pos);

            update(_current_pos);
        });

        !_running && loop();

        return self;
    }

    Stick.prototype = {
        /**
         @property size
         @type Number
         @default 200
         **/
        size: 200,

        /**
         @property mode
         @type String
         @default "circular"
         **/
        mode: CIRC,

        /**
         @property autohide
         @type Boolean
         @default false
         **/
        autohide: false,

        /**
         @property targeting
         @type Boolean
         @default true
         **/
        targeting: true,

        /**
         @property shadow_offset
         @type Number
         @default 0.25
         **/
        shadow_offset: 0.25,

        /**
         @property limit
         @type Number
         @default 36
         **/
        limit: 36,

        /**
         @property analog
         @type Boolean
         @default false
         **/
        analog: false,


        /**
         @property axis_value
         @type Number
         @default 0x100
         **/
        axis_value: 0x100,


        /**
         @property bounce
         @type Number
         @default 3
         **/
        bounce: 3,


        /**
         @property spritesheet
         @type Object
         **/
        spritesheet: {
            stick: [152, 16, 85, 85],
            shadow: [252, 16, 85, 85],
            circ_background: [0, 0, 123, 123],
            vert_background: [355, 0, 49, 141],
            horz_background: [0, 133, 141, 49]
        },

        /**
         @method start
         **/
        start: function () {
        },

        /**
         @method move
         **/
        move: function () {
        },

        /**
         @method end
         **/
        end: function () {
        },

        /**
         @method drawBackground
         **/
        drawBackground: function () {
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.setTransform(1, 0, 0, 1, this.size / 2, this.size / 2);

            var background;

            switch (this.mode) {
                case VERT:
                    background = this.spritesheet.vert_background;
                    break;
                case HORZ:
                    background = this.spritesheet.horz_background;
                    break;
                default:
                    background = this.spritesheet.circ_background;
                    break;
            }

            this.ctx && this.ctx.drawImage(sprite_resource, background[0], background[1], background[2], background[3], background[2] / -2, background[3] / -2, background[2], background[3]);
        },

        /**
         @method drawShadow
         @param start_pos
         @param current_pos
         **/
        drawShadow: function (start_pos, current_pos) {
            var point = getStickPosition.call(this, start_pos, current_pos);

            point[0] += point[0] * this.shadow_offset + 10;
            point[1] += point[1] * this.shadow_offset + 10;

            var shadow = this.spritesheet.shadow;
            this.ctx && this.ctx.drawImage(sprite_resource, shadow[0], shadow[1], shadow[2], shadow[3], point[0] - shadow[2] / 2, point[1] - shadow[3] / 2, shadow[2], shadow[3]);

        },

        /**
         @method drawStick
         @param start_pos
         @param current_pos
         **/
        drawStick: function (start_pos, current_pos) {
            var point = getStickPosition.call(this, start_pos, current_pos),
                stick = this.spritesheet.stick;

            this.ctx && this.ctx.drawImage(sprite_resource, stick[0], stick[1], stick[2], stick[3], point[0] - stick[2] / 2, point[1] - stick[3] / 2, stick[2], stick[3]);
        },

        /**
         @method draw
         @param start_pos
         @param current_pos
         **/
        draw: function (start_pos, current_pos) {
            if (this.ctx && sprite_resource.width) {
                this.drawBackground();
                this.drawShadow(start_pos, current_pos);
                this.drawStick(start_pos, current_pos);
            }
        },

        /**
         @method show
         @param x [Number]
         @param y [Number]
         **/
        show: function (x, y) {
            if (this.canvas) {
                this.canvas.style.display = 'block';

                if (this.targeting) {
                    this.canvas.style.left = ( x - this.canvas.width / 2 ) + 'px';
                    this.canvas.style.top = ( y - this.canvas.height / 2 ) + 'px';
                }

                this.draw([x, y], [x, y]);
            }
        },

        /**
         @method hide
         **/
        hide: function () {
            if (this.canvas) {
                this.canvas.style.display = 'none';
            }
        }
    }


    function Buttons(options) {
        var self = new Abstract();

        extend(self, this);
        extend(self, options);

        var max_x = Math.max(this.sub_positions.button_a[0],
            this.sub_positions.button_b[0],
            this.sub_positions.button_x[0],
            this.sub_positions.button_y[0]);

        var min_x = Math.min(this.sub_positions.button_a[0],
            this.sub_positions.button_b[0],
            this.sub_positions.button_x[0],
            this.sub_positions.button_y[0]);

        self.size = Math.abs(min_x) + Math.abs(max_x) + self.button_radius * 2;

        self.init();

        _pressed = {}, _scales = {};

        _anim_loops.push(function () {
            for (var i in _scales) {
                if (!_pressed[i]) {
                    _scales[i] -= self.release_speed;
                }
                if (_scales[i] < 0) {
                    _scales[i] = 0;
                }
            }

            self.draw(_scales);
        });

        !_running && loop();


        function buttonCollideCheck(e, callback, is_pressed) {
            //var coords = getCoords( e );
            var coords = self.isInRegion(e);

            /*for( var i in _pressed ){
             _pressed[ i ] = false;
             }*/

            if (!coords) {
                return;
            }

            for (var i in self.sub_positions) {
                var sub_point = self.sub_positions[i];
                var x = self.x + sub_point[0],
                    y = self.y + sub_point[1];
                if (Math.sqrt(Math.pow(x - coords.pageX, 2) + Math.pow(y - coords.pageY, 2)) <= self.button_radius) {
                    callback(i);
                    _pressed[i] = is_pressed;
                    if (_pressed[i]) {
                        _scales[i] = 1;
                    }
                }
            }
        }

        document.getElementById('joystick').addEventListener(DOWN, function (e) {
            e.preventDefault();
            self.down && buttonCollideCheck(e, self.down, true);
        });

        self.canvas.addEventListener(UP, function (e) {
            for (var i in _pressed) {
                if (_pressed[i]) {
                    _pressed[i] = false;
                    self.up && self.up(i);
                }
            }
        });

        return self;
    }

    Buttons.prototype = {
        /**
         @property release_speed
         @type Number
         @default 0.05
         **/
        release_speed: 0.05,


        /**
         @property button_radius
         @type Number
         @default 41
         **/
        button_radius: 41,


        /**
         @property spritesheet
         @type Object
         **/
        spritesheet: {
            button_a: [160, 119, 73, 73],
            button_b: [240, 119, 73, 73],
            button_x: [160, 199, 73, 73],
            button_y: [240, 199, 73, 73],
            background: [0, 190, 82, 82]
        },


        /**
         @property sub_positions
         @type Object
         **/
        sub_positions: {
            button_a: [-50, 50],
            button_b: [50, 50],
            button_x: [-50, -50],
            button_y: [50, -50]
        },


        /**
         @method drawBackground
         @param relative_point
         @param index
         **/
        drawBackground: function (relative_point, index) {
            var point = [this.size / 2, this.size / 2];
            point[0] += relative_point[0];
            point[1] += relative_point[1];

            var background = this.spritesheet.background;

            this.ctx && this.ctx.drawImage(sprite_resource, background[0], background[1], background[2], background[3], point[0] - background[2] / 2, point[1] - background[3] / 2, background[2], background[3]);
        },


        /**
         @method drawButton
         @param relative_point
         @param index
         @param scale
         **/
        drawButton: function (relative_point, index, scale) {
            var point = [this.size / 2, this.size / 2];
            point[0] += relative_point[0];
            point[1] += relative_point[1];

            var button = this.spritesheet[index];

            if (this.ctx) {
                this.ctx.save();
                this.ctx.translate(point[0], point[1]);
                this.ctx.scale(1 - 0.2 * scale, 1 - 0.2 * scale);
                this.ctx.translate(-point[0], -point[1]);
                this.ctx.drawImage(sprite_resource, button[0], button[1], button[2], button[3], point[0] - button[2] / 2, point[1] - button[3] / 2, button[2], button[3]);
                this.ctx.restore();
            }
        },


        /**
         @method draw
         @param scales
         **/
        draw: function (scales) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            for (var i in this.sub_positions) {
                this.drawBackground(this.sub_positions[i], i);
                this.drawButton(this.sub_positions[i], i, scales[i]);
            }
        }
    }


    global.Joystick = {
        CircuralStick: function CircuralStick(options) {
            return new Stick(options);
        },

        HorizontalStick: function HorizontalStick(options) {
            extend(options, {
                mode: HORZ
            });

            return new Stick(
                options
            );
        },

        VerticalStick: function VerticalStick(options) {
            extend(options, {
                mode: VERT
            });

            return new Stick(
                options
            );
        },

        Buttons: Buttons
    }

})(this);