/*globals Backbone, _, jQuery, console */

(function(Backbone, _, $) {
    "use strict";

    var checkbox = new Backbone.UI.Checkbox({
        el : $('.cbx_example'),
        settings : {
            caption : 'First checkbox'
        }
    }).on('cbx:change:check', function(_cbx, check) {
        console.log('checkbox state: ', check);
    });

	var checkbox2 = new Backbone.UI.Checkbox({
        el : $('.cbx_example2'),
        settings : {
            caption : 'Second checkbox',
			disabled : true
        }
    });
}(Backbone, _, jQuery));