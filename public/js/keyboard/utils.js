define(["jquery"], function ($) {

    $.fn.redraw = function(){
        return $(this).each(function(){
            var redraw = this.offsetHeight;
        });
    };

    return {
        //http://wowmotty.blogspot.de/2009/06/convert-jquery-rgb-output-to-hex-color.html
        rgb2hex: function (orig) {
            var rgb = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+)/i);
            return (rgb && rgb.length === 4) ? "#" +
            ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
            ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
            ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : orig;
        },

        //https://css-tricks.com/snippets/javascript/lighten-darken-color/
        lightenDarkenColor: function (col, amt) {
            var usePound = false;
            if (col[0] == "#") {
                col = col.slice(1);
                usePound = true;
            }
            var num = parseInt(col, 16);

            var r = (num >> 16) + amt;
            if (r > 255) r = 255;
            else if (r < 0) r = 0;

            var b = ((num >> 8) & 0x00FF) + amt;
            if (b > 255) b = 255;
            else if (b < 0) b = 0;

            var g = (num & 0x0000FF) + amt;
            if (g > 255) g = 255;
            else if (g < 0) g = 0;

            return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);

        },

        parseKeyId: function(idString) {
            var isModKey = false;
            if (idString.search('m') == 0) {
                idString = idString.slice(1);
                isModKey = true;
            }
            return [isModKey, parseInt(idString)];
        }
    }
});