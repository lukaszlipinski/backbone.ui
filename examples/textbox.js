/*globals Backbone, _, jQuery, console */

(function(Backbone, _, $) {
    "use strict";

    var textbox = new Backbone.UI.Textbox({
		el : $('.txt_example'),
		settings : {
			value : '',
			clearButton : true,
			live : true,
			emptyMessage : 'Insert your name'
		}
	}).on('txt:change:value', function(_txt, val, prev_val) {
		console.log('event:', val, prev_val);
	});

	window.lol = textbox;
}(Backbone, _, jQuery));