/**
 * Created by rouven on 01.08.16.
 */

require(["common"], function(common) {
    require(["jquery", "socketio", "keyboard/settings"], function ($, io, settings) {

        //http://wowmotty.blogspot.de/2009/06/convert-jquery-rgb-output-to-hex-color.html
        function rgb2hex(orig){
            var rgb = orig.replace(/\s/g,'').match(/^rgba?\((\d+),(\d+),(\d+)/i);
            return (rgb && rgb.length === 4) ? "#" +
            ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
            ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
            ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : orig;
        }

        //https://css-tricks.com/snippets/javascript/lighten-darken-color/
        function lightenDarkenColor(col, amt) {

            var usePound = false;

            if (col[0] == "#") {
                col = col.slice(1);
                usePound = true;
            }

            var num = parseInt(col,16);

            var r = (num >> 16) + amt;

            if (r > 255) r = 255;
            else if  (r < 0) r = 0;

            var b = ((num >> 8) & 0x00FF) + amt;

            if (b > 255) b = 255;
            else if  (b < 0) b = 0;

            var g = (num & 0x0000FF) + amt;

            if (g > 255) g = 255;
            else if (g < 0) g = 0;

            return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);

        }

        $.fn.redraw = function(){
            return $(this).each(function(){
                var redraw = this.offsetHeight;
            });
        };

        function showInput(str) {
            $('#inputOverlay').find('p').text(str).parent().addClass('active').redraw().removeClass('active');
        }


        function loadKeyboardLayout(layout, cb) {
            var fn = settings.ALL_KEYBOARDS[layout];
            if (fn == null) throw 'unknown layout: '+layout;
            fn = settings.KEYBOARDS_PATH+fn;
            var div = $('#keyboard-container');
            $.get(fn, function (data) {
                var svg = $(data.rootElement);
                svg.removeAttr('height').removeAttr('width').attr('id', 'keyboard');
                div.html('');
                div.append(svg);
                if (cb != null) cb();
            });

        }

        var clicked = [];

        function setKeyboardBindings(socket) {
            var idToColor = {};

            $("svg#keyboard > g > g").hover(function () {
                // hover in
                var path = $(this).find("> path:first-child");
                idToColor[path.attr('id')] = path.css('fill');
                //path.css('fill', lightenDarkenColor(rgb2hex(path.css('fill')), -10));
                if ($(this).attr("id") != "settings") {
                    path.css('fill', "rgb(215, 250, 255)");
                } else {
                    path.css('fill', "rgb(0, 125, 141)");
                }
            }, function () {
                // hover out
                var path = $(this).find("> path:first-child");
                //path.css('fill', lightenDarkenColor(rgb2hex(path.css('fill')), 10));
                path.css('fill', idToColor[path.attr("id")]);
            });
            // TODO: color change for click as well


            $("svg#keyboard > g > g#settings").click(function () {
                // open settings dialog
                $('#settings-modal').removeClass('closed');
            });

            $("svg#keyboard > g > g:not(#settings)").on("mousedown touchstart", function (event) {
                event.preventDefault();
                var keyCode = parseInt($(this).attr('id'));
                console.info("Press", keyCode);
                socket.emit("boardEvent", {type: 0x01, code: keyCode, value: 1});
                if ($.inArray(keyCode, clicked) < 0) {
                    clicked.push(keyCode)
                }
            }).on("mouseleave mouseup touchend", function (event) {
                event.preventDefault();
                var keyCode = parseInt($(this).attr('id'));
                var idx = $.inArray(keyCode, clicked);
                if (idx >= 0) {
                    console.info("Release", keyCode);
                    socket.emit("boardEvent", {type: 0x01, code: keyCode, value: 0});
                    clicked.splice(idx, 1);
                }
            });
        }

        function initDialog() {
            for (var i in settings.ALL_KEYBOARDS) {
                if (settings.keyboardLayout == i) {
                    $('#settings-layout').append(
                        '<option value="' + i + '" selected>' + i + '</option>'
                    );
                } else {
                    $('#settings-layout').append(
                        '<option value="' + i + '">' + i + '</option>'
                    );
                }
            }
            $('#settings-sticky').prop('checked', settings.stickyModKeys);
            $('#settings-physical').prop('checked', settings.physicalKeyboard);
        }

        function initSettings() {
            initDialog();
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
                $('#settings-modal').addClass('closed');
                event.preventDefault();
                event.stopPropagation();
            })
        }

        function init(cb) {
            loadKeyboardLayout(settings.keyboardLayout, cb);
            initSettings();
        }


        require(["lib/domReady"], function (domReady) {
            domReady(function () {
                var socket = io();

                init(function () {
                    $('.loader').hide();
                    socket.on("keyboardConnected", function(data) {
                        // var boardId = data.boardId;

                        setKeyboardBindings(socket);
                    });
                });

                socket.on("connect", function() {
                    socket.emit("connectKeyboard", null);
                });

                socket.on("disconnect", function() {
                    location.reload();
                });




                $("#keyboardInput").focus();

                $(".modal .close, .modal-wrapper").click(function (event) {
                    $(this).parents('.modal-wrapper').addBack('.modal-wrapper').addClass('closed');
                });
                $(".modal").click(function (event) {
                    event.stopPropagation();
                });

                $("window").on('keydown', function (e) {
                    $("#keyboardInput").keydown(e);
                });

                $("#keyboardInput").on('keydown', function (e) {
                    console.log(e.keyCode);
                    var keyCode = e.keyCode;
                    switch (keyCode) {
                        case 16:
                        case 17:
                        case 18:
                        case 20:
                        case 225:
                            return; // ignoring shift, ctrl, meta, alt, caps, alt gr
                    }
                    if (keyCode == 0 || keyCode == 229) {
                        // probably mobile keyboard
                        var v = $(this).val();
                        if (v.length > 0) {
                            var key = v[v.length-1];
                            $(this).val('')
                        }
                    } else {
                        var key = e.key;
                    }
                    var alt = e.altKey;
                    var altGr = e.keyModifierStateAltGraph;
                    var ctl = e.ctrlKey;
                    var shift = e.shiftKey;
                    var meta = e.metaKey;

                    var inputStr = [];
                    if (ctl) inputStr.push('Ctrl');
                    if (meta) inputStr.push('Meta');
                    if (alt) inputStr.push('Alt');
                    inputStr.push(key);
                    showInput(inputStr.join('+')+' ('+keyCode+')');
                    return false;
                });
            });
        });
    });
});
