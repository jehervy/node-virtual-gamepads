define(["jquery", "./utils", "./settings"], function ($, util, settings) {

    var clickedKeys = [];
    var activeModKeys = {};
    function bindClickAndTouchEvents(cb, settingsCb) {
        $("svg#keyboard > g > g#settings").on("mousedown touchstart", function () {
            $(this).attr('class', 'active');
            settingsCb();
            $('#settings-modal').removeClass('closed');
        }).on("mouseleave mouseup touchend", function (event) {
            $(this).removeAttr('class');
        });

        $("svg#keyboard > g > g:not(#settings)").on("mousedown touchstart", function (event) {
            event.preventDefault();
            $(this).attr('class', 'active');
            var key = util.parseKeyId($(this).attr('id'));
            var keyIsModKey = key[0]; var keyCode = key[1];

            if ($.inArray(keyCode, clickedKeys) == -1) {
                clickedKeys.push(keyCode);
                if (keyIsModKey && settings.stickyModKeys && !(keyCode in activeModKeys)) {
                    activeModKeys[keyCode] = [0, $(this)];
                    console.info("Activated mod key", keyCode);
                    if (cb != null) cb({type: 0x01, code: keyCode, value: 1, hardware: false});
                } else {
                    console.info("Clicked", keyCode);
                    if (cb != null) cb({type: 0x01, code: keyCode, value: 1, hardware: false});
                }
            }
        }).on("mouseleave mouseup touchend", function (event) {
            var key = util.parseKeyId($(this).attr('id'));
            var keyIsModKey = key[0]; var keyCode = key[1];
            var idx = $.inArray(keyCode, clickedKeys);
            if (idx >= 0) {
                clickedKeys.splice(idx, 1);
                if (keyIsModKey && settings.stickyModKeys && keyCode in activeModKeys) {
                    if (activeModKeys[keyCode][0] == 0) {
                        // first key release
                        activeModKeys[keyCode][0] = 1;
                        return;
                    }
                    delete activeModKeys[keyCode];
                    $(this).removeAttr('class');
                    if (cb != null) cb({type: 0x01, code: keyCode, value: 0, hardware: false});
                } else {
                    console.info("Released click", keyCode);
                    $(this).removeAttr('class');
                    if (cb != null) cb({type: 0x01, code: keyCode, value: 0, hardware: false});
                    for (key in activeModKeys) {
                        var code = parseInt(key);
                        activeModKeys[key][1].removeAttr('class');
                        delete activeModKeys[key];
                        console.info("Deactivated mod key", code);
                        if (cb != null) cb({type: 0x01, code: code, value: 0, hardware: false});
                    }
                }
            }
        });
    }

    return {
        listen: function (cb, settingsCb) {
            bindClickAndTouchEvents(cb, settingsCb);
        }
    }
});