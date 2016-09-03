define(function () {

    var settings = {};

    settings.KEYBOARDS_PATH = '/images/keyboards/';
    settings.ALL_KEYBOARDS = {'en-US': 'en-US.svg'};


    var localStorageAvailable = (typeof(Storage) !== "undefined");

    settings.keyboardLayout = null;
    settings.stickyModKeys = null;
    settings.physicalKeyboard = null;

    settings.update = function(update) {
        if (update.hasOwnProperty('keyboardLayout')) settings.keyboardLayout = update.keyboardLayout;
        if (update.hasOwnProperty('stickyModKeys')) settings.stickyModKeys = update.stickyModKeys;
        if (update.hasOwnProperty('physicalKeyboard')) settings.physicalKeyboard = update.physicalKeyboard;
        if (localStorageAvailable) {
            window.localStorage.setItem('keyboardSettings', JSON.stringify({
                keyboardLayout: settings.keyboardLayout,
                stickyModKeys: settings.stickyModKeys,
                physicalKeyboard: settings.physicalKeyboard
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
                physicalKeyboard: false
            }
        } else {
            return {
                keyboardLayout: keyboardLayout,
                stickyModKeys: true,
                physicalKeyboard: true
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
