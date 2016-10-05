define(function () {

    var settings = {};

    /*
     * Settings modal stuff
     */

    settings.modal = {};
    settings.modal.isOpen = false;

    // initialize settings modal
    require(["lib/domReady", "jquery"], function (domReady, $) {
        var settingsModal = $("#settings-modal");

        settings.modal.open = function () {
            settingsModal.removeClass('closed');
            settings.modal.isOpen = true;
        };
        settings.modal.close = function () {
            settingsModal.addClass('closed');
            settings.modal.isOpen = false;
        };

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
                settingsModal.modal.close();
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
    settings.KEYBOARDS_PATH = '/images/keyboards/';
    settings.ALL_KEYBOARDS = {'en-US': 'en-US.svg'};


    var localStorageAvailable = (typeof(Storage) !== "undefined");

    settings.keyboardLayout = null;
    settings.stickyModKeys = null;

    settings.update = function(update) {
        if (update.hasOwnProperty('keyboardLayout')) settings.keyboardLayout = update.keyboardLayout;
        if (update.hasOwnProperty('stickyModKeys')) settings.stickyModKeys = update.stickyModKeys;
        if (localStorageAvailable) {
            window.localStorage.setItem('keyboardSettings', JSON.stringify({
                keyboardLayout: settings.keyboardLayout,
                stickyModKeys: settings.stickyModKeys,
            }));
        }
    };

    function isTouchDevice() {
        try {
            document.createEvent("TouchEvent");
            return true;
        } catch (e) {
            return false;
        }
    }

    function getBestLayoutMatch(lang) {
        if (lang in settings.ALL_KEYBOARDS) return lang;
        var lang_base = lang.split('-')[0];
        if (lang_base in settings.ALL_KEYBOARDS) return lang_base;
        for (var kb in settings.ALL_KEYBOARDS) {
            if (lang_base == kb.split('-')[0]) return kb;
        }
        return Object.keys(settings.ALL_KEYBOARDS)[0];
    }

    function defaultSettings() {
        var userLang = navigator.language || navigator.userLanguage;
        var keyboardLayout = getBestLayoutMatch(userLang);
        if (isTouchDevice()) {
            return {
                keyboardLayout: keyboardLayout,
                stickyModKeys: false,
            }
        } else {
            return {
                keyboardLayout: keyboardLayout,
                stickyModKeys: true,
            }
        }
    }

    function init() {
        if (localStorageAvailable) {
            var keyboardSettings = window.localStorage.getItem("keyboardSettings");
            if (keyboardSettings == null) {
                keyboardSettings = defaultSettings();
            } else {
                keyboardSettings = JSON.parse(keyboardSettings);
            }
            settings.update(keyboardSettings);
        } else {
            console.error('localStorage not available. Settings can\'t be stored.')
        }
    }

    init();

    return settings;
});
