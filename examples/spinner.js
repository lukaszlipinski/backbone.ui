/*globals Backbone, _, jQuery, console */

(function(Backbone, _, $) {
    "use strict";

    var spinner = new Backbone.UI.Spinner({
		el : $('.sp_example'),
		settings : {
			value : 600,
			max : 3300,
			type : 'integer',
			disabled : false
		}
	}).on('sp:change:value', function(_sp, val, old_val) {
		console.log(val, old_val);
	}).on('sp:change:max', function(_sp, max) {
		console.log("max changed", max);
	}).on('sp:change:min', function(_sp, min) {
		console.log("min changed", min);
	});

	var btn_set_max = new Backbone.UI.Button({
        el : $('.btn_set_max'),
        settings : {
            caption : 'Set max'
        }
    }).on('btn:click', function() {
		spinner.setMax(500);
	});

    var btn_set_min = new Backbone.UI.Button({
        el : $('.btn_set_min'),
        settings : {
            caption : 'Set min'
        }
    }).on('btn:click', function() {
		spinner.setMin(-100);
	});
}(Backbone, _, jQuery));