/*globals Backbone, _, jQuery, console */

(function(Backbone, _, $) {
    "use strict";

    window.checkbox = new Backbone.UI.Checkbox({
        el : $('.cbx_example'),
        settings : {
            caption : 'First checkbox'
        }
    }).on('cbx:change:checked', function(_cbx, checked) {
        console.log('checkbox state: ', checked);
    });
}(Backbone, _, jQuery));