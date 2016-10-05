/**
 * Created by rouven on 01.08.16.
 */

require(["common"], function(common) {
    require([
        "jquery",
        "socketio",
        "keyboard/utils",
        "keyboard/settings",
        "keyboard/input"],
        function ($, io, utils, settings, input) {

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


        function init(cb) {
            loadKeyboardLayout(settings.keyboardLayout, cb);
        }


        require(["lib/domReady"], function (domReady) {
            domReady(function () {
                var socket = io();

                init(function () {
                    $('.loader').hide();
                    socket.on("keyboardConnected", function(data) {
                        input.listen(function (data) { // key callback
                            socket.emit("boardEvent", data);
                        }, function () { // settings callback
                            settings.modal.open();
                        });
                    });
                });

                socket.on("connect", function() {
                    socket.emit("connectKeyboard", null);
                });

                socket.on("disconnect", function() {
                    location.reload();
                });
            });
        });
    });
});
