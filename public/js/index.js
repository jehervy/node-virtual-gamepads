/**
 * Created by rouven on 25.02.17.
 */

require(["common"], function(common) {
    require([
        "jquery",
        "lib/domReady"],
        function ($, domReady) {
            $(".slide-link").click(function(e) {
                if (
                    e.ctrlKey ||
                    e.shiftKey ||
                    e.metaKey || // apple
                    (e.button && e.button == 1) // middle click, >IE9 + everyone else
                ){
                    return;
                }
                e.preventDefault();

                var target = $(this).attr('href');

                $('body').bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){
                    window.location = target;
                }).addClass('slide-left');

                return false;
            });
            if (location.href.match(/\?analog$/)){
                $('[href="gamepad.html"]').attr('href', 'gamepad.html?analog');
            }
        });
});
